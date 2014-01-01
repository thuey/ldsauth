'use strict';

var phantom = require('node-phantom-simple')
  , fs = require('fs')
  , path = require('path')
  , forEachAsync = require('forEachAsync').forEachAsync
  , simplestUrl = 'https://www.lds.org/directory/services/ludrs/mem/current-user-id/'
  , ssoUrl = 'https://signin.lds.org/SSOSignIn/'
  , errorUrl = 'https://signin.lds.org/SSOSignIn/?error=authfailed'
  , signInFnStr = fs.readFileSync(path.join(__dirname, 'support', 'sign-in.js'), 'utf8')
  , getDataFnStr = fs.readFileSync(path.join(__dirname, 'support', 'get-data.js'), 'utf8')
  ;

function wrapAsync(fnStr) {
  // ensure that the phantom callback is async
  return 'function () {\nsetTimeout(' + fnStr + ', 0); return null;\n}';
}

function ifErr(next) {
  return function (err) {
    if (err) { throw err; }
    next();
  };
}

function noop() {}


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
//module.exports.callApi = function (username, password, apiFn, apiArgs, done) {
  var username = opts.username
    , password = opts.pssword
    , ph = opts.phantom
    , page = opts.page
    , apiFn = opts.method
    , apiArgs = opts.args
    , emitter = opts.emitter
    ;

  function callMethod(ph, page) {
    function injectApiCall(scripts) {
      function injectJs(next, scriptName) {
        var scriptPath = path.join(__dirname, 'support', scriptName)
          ;

        if (!page.loadedScripts[scriptPath]) {
          page.loadedScripts[scriptPath] = true;
          page.injectJs(scriptPath, ifErr(next));
        }
      }

      function execJs() {
        var directiveStr = JSON.stringify({ fn: apiFn, args: apiArgs })
          , fnStr = wrapAsync(getDataFnStr.replace(/__DIRECTIVE__/g, directiveStr))
          ;

        page.evaluate(fnStr, noop);
      }

      forEachAsync(scripts, injectJs).then(execJs);
    }

    page.onUrlChanged = function(targetUrl) {
      // This shouldn't happen. Abandon ship!
      ph.exit();
      console.log('[Unexpected targetUrl]', targetUrl);
    };

    page.onCallback = function(data) {
      var event = data.event;
      delete data.event;
      emitter.emit(event, data.value);
    };

    page.onConsoleMessage = function () {
      console.log('[CONSOLE]');
      console.log(arguments);
    };

    page.onError = function (err) {
      emitter.emit('error', err);
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

  function initializePage(err, ph) {
    function fin(err, data) {
      done(err, data);
      setTimeout(function () {
        ph.exit();
      });
    }


    console.log('created phantom instance');
    ph.createPage(function(err, page) {
      console.log('created page instance');
      page.loadedScripts = {};

      function signIn() {
        console.log('attempting sign in');
        var fnStr = wrapAsync(signInFnStr.replace(/__USERNAME__/g, username).replace(/__PASSWORD__/g, password))
          ;

        page.evaluate(
          fnStr
        , function (err, stuff) {
            if (err) {
              console.log('Error at Sign-in');
              console.log(err);
              ph.exit();
              return;
            }

            console.log('submit complete, awaiting url change', stuff);
          }
        );
      }

      page.onResourceRequested = function(requestData/*, request*/) {
        console.log('Requesting "', requestData[0].url.substr(0, 100), '"', requestData.length);
        // TODO request.abort()
      };

      page.onLoadFinished = function () {
        // often never happens
        console.log('load finished');
      };

      page.onUrlChanged = function(targetUrl) {
        page.loadedScripts = {};
        console.log('New URL: ' + targetUrl);
        // TODO ignore all requests
        if (targetUrl === ssoUrl) {
          console.log('Prepare for sign in');
          page.onLoadFinished = function () {
            delete page.onLoadFinished;
            console.log('sign-in load finished');
            signIn();
          };
        } else if (errorUrl === targetUrl) {
          fin(new Error('Login attempt failed'));
        } else if (simplestUrl === targetUrl) {
          page.onLoadFinished = function () {
            delete page.onLoadFinished;
            callMethod(ph, page);
          };
        }
      };

      page.onCallback = function(data) {
        console.log('CALLBACK: ' + JSON.stringify(data));  // Prints 'CALLBACK: { "hello": "world" }'
        if (data && 'done' === data.event) {
          fin(null, data);
        }
      };

      page.onConsoleMessage = function () {
        console.log(arguments);
      };

      page.onError = function (err) {
        console.error(arguments);
        fin(err);
      };

      page.open(simplestUrl, function (err, status) {
        console.log('opening page...');

        if (err || 'success' !== status) {
          console.log('err, status', err, status);
          fin(err || new Error('Not Successful'));
          return;
        }
      });
    });
  }

  if (!page) {
    phantom.create(
      initializePage
    , { parameters: { 'local-storage-path': path.join(__dirname, 'html5-storage'), 'disk-cache': 'true' } }
    );
  } else {
    callMethod(ph, page);
  }
};
