'use strict';

var Phantom = require('node-phantom-simple')
  , PhantomEmitter = require('phantom-emitter')
  , fs = require('fs')
  , path = require('path')
  , forEachAsync = require('forEachAsync').forEachAsync
  , simplestUrl = 'https://www.lds.org/directory/services/ludrs/mem/current-user-id/'
  , ssoUrl = 'https://signin.lds.org/SSOSignIn/'
  , errorUrl = 'https://signin.lds.org/SSOSignIn/?error=authfailed'
  , signInFnStr = fs.readFileSync(path.join(__dirname, 'support', 'ldsorg-sign-in.js'), 'utf8')
  , clientApiPath = path.join(__dirname, 'support', 'ldsorg-api-wrapper.js')
  ;

function ifErr(next) {
  return function (err) {
    if (err) { throw err; }
    next();
  };
}

    /*
    {
      // All Household Data
      householdInit: function (household) {
        console.log('      ' + household.householdName);
      }
    , household: function (household) {
        console.log('      ' + household.coupleName);
        //console.log(household);
      }
    , householdPhotoInit: function (household) {
        console.log('        fam pic via ' + household.headOfHousehold.photoUrl);
      }
    , householdPhoto: function (household, dataUrl) {
        console.log('        fam pic' + dataUrl.length, 'bytes as dataUrl');
      }
      // TODO spouse and children
    , individualPhotoInit: function (individual) {
        console.log('        photo op: ' + (individual.headOfHouse.preferredName));
      }
    , individualPhoto: function (individual, dataUrl) {
        console.log('        photo op: ' + dataUrl.length, 'bytes as dataUrl');
      }
    , householdEnd: function (household) {
        console.log('');
      }
    }
    'getWardData'
    { fullHouseholds: false }
    */

module.exports.callApi = function (done, opts) {
  var username = opts.username
    , password = opts.password
    , phantom = opts.phantom
    , page = opts.page
    , emitter = opts.emitter
    , apiFn = opts.method
    , apiArgs = opts.args
    , eventNameI = 1
    ;

  function nextEventName() {
    if (eventNameI >= 40) {
      eventNameI = 0;
    }

    eventNameI += 1;
    return '_ldsorgDone-' + eventNameI;
  }

  function callMethod(phantom, page, emitter) {

    function injectApiCall(scripts) {
      function injectJs(next, scriptName) {
        var scriptPath = path.join(__dirname, 'support', scriptName)
          ;

        if (!page._loadedScripts[scriptPath]) {
          page._loadedScripts[scriptPath] = true;
          page.injectJs(scriptPath, ifErr(next));
        }
      }

      function execJs() {
        var doneEvent = nextEventName()
          ;

        emitter.once(doneEvent, function (data) {
          done(
            null
          , { username: username
            , password: password
            , phantom: phantom
            , page: page
            , emitter: emitter
            , event: doneEvent
            }
          , data
          );
        });

        page.injectJs(clientApiPath, function () {
          console.log('loaded wrapper in browser');
          emitter.on('ldsorgReady', function () {
          /*
            console.log('[ldsorgReady]');
            //emitter.emit('directive', doneEvent, apiFn, apiArgs);
          */
          });
        });
      }

      forEachAsync(scripts, injectJs).then(execJs);
    }

    page.onUrlChanged = function(targetUrl) {
      page._loadedScripts = {};
      // This shouldn't happen. Abandon ship!
      console.log('[Unexpected targetUrl]', targetUrl);
      phantom.exit();
    };

    page.onConsoleMessage = function () {
      var args = [].slice.apply(arguments);
      console.log('[CONSOLE]');
      console.log(args);
    };

    page.onError = function (err) {
      emitter.emit('scriptError', err);
    };

    if ('getMinData' === apiFn) {
      injectApiCall(['jquery-2.0.3.min.js']);
    } else {
      injectApiCall([
        'jquery-2.0.3.min.js'
      , 'ldsorg.pakmanaged.js'
      , 'IndexedDBShim.min.js'
      ]);
    }
  }

  function initializePage(err, _phantom) {
    phantom = _phantom;

    function fin(err, data) {
      var meta
        ;

      if (!err) {
        meta = {
           username: username
        , password: password
        , phantom: phantom
        , page: page
        , emitter: emitter
        };
      } else {
        setTimeout(function () { phantom.exit(); });
      }

      done(err, meta, data);
    }

    console.log('created phantom instance');
    phantom.createPage(function (err, _page) {
      console.log('created page instance');
      page = _page;

      page._loadedScripts = {};

      function signIn() {
        console.log('attempting sign in as', username + ":" + (!!password && '[hidden]'));

        // TODO
        page.evaluate(
          signInFnStr.replace(/__USERNAME__/g, username).replace(/__PASSWORD__/g, password)
        , function (err) {
            if (!err) {
              return;
            }

            console.log('Error at Sign-in');
            console.log(err);
            phantom.exit();
            return;
          }
        );
      }

      page.onResourceRequested = function (requestData/*, request*/) {
        console.log('Requesting "', requestData[0].url.substr(0, 100), '"', requestData.length);
        // TODO request.abort()
      };

      page.onLoadFinished = function () {
        // often never happens
        console.log('load finished');
      };

      function signInOnLoaded() {
        delete page.onLoadFinished;
        signIn();
      }

      function callMethodOnLoaded() {
        emitter = new PhantomEmitter(page);

        delete page.onLoadFinished;
        callMethod(phantom, page, emitter);
      }

      page.onUrlChanged = function (targetUrl) {
        page._loadedScripts = {};
        console.log('New URL: ' + targetUrl);
        // TODO ignore all requests
        if (targetUrl === ssoUrl) {
          page.onLoadFinished = signInOnLoaded;
        } else if (errorUrl === targetUrl) {
          fin(new Error('Login attempt failed'));
        } else if (simplestUrl === targetUrl) {
          page.onLoadFinished = callMethodOnLoaded;
        }
      };

      page.onConsoleMessage = function () {
        var args = [].slice.apply(arguments);
        console.log('[console]', args);
      };

      page.onError = function (err) {
        console.error('[error]');
        console.error(err);
        fin(err);
      };

      page.open(simplestUrl, function (err, status) {
        console.log('opening page...', status);

        if (err || 'success' !== status) {
          console.log('err, status', err, status);
          fin(err || new Error('Not Successful'));
        }
      });
    });
  }

  if (!page) {
    Phantom.create(
      initializePage
    , { parameters: { 'local-storage-path': path.join(__dirname, 'html5-storage'), 'disk-cache': 'true' } }
    );
  } else {
    callMethod(phantom, page, emitter);
  }
};
