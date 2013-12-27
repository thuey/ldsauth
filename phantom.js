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

module.exports.callApi = function (username, password, apiFn, apiArgs, done) {
  console.log('inside callApi');
  phantom.create(function (err, ph) {
    var abortAll = true
      ;

    function fin(err, data) {
      done(err, data);
      setTimeout(function () {
        ph.exit();
      });
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

    console.log('created phantom instance');
    ph.createPage(function(err, page) {
      console.log('created page instance');

      function injectApiCall(scripts) {
        console.log('injecting call scripts');
        forEachAsync(scripts, function (next, scriptName) {
          console.log(path.join(__dirname, 'support', scriptName));
          page.injectJs(path.join(__dirname, 'support', scriptName), function (/*err*/) {
            next();
          });
        }).then(function () {
          var directiveStr = JSON.stringify({ fn: apiFn, args: apiArgs })
            , fnStr = wrapAsync(getDataFnStr.replace(/__DIRECTIVE__/g, directiveStr))
            ;

          console.log('fnStr');
          console.log(fnStr);
          page.evaluate(
            fnStr
          , function () {
              console.log('injectedApiCall');
            }
          );
        });
      }

      function signIn() {
        console.log('attempting sign in');
        var fnStr = wrapAsync(signInFnStr.replace(/__USERNAME__/g, username).replace(/__PASSWORD__/g, password))
          ;

        console.log(fnStr);
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

      page.onResourceRequested = function(requestData, request) {
        console.log('Requesting "', requestData[0].url.substr(0, 100), '"', requestData.length);
        if (request && abortAll && !/jquery/i.test(requestData[0].url)) {
          // TODO don't load any images or css
          request.abort();
        }
        /*
        if ((/http:\/\/.+?\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/css') {
          console.log('The url of the request is matching. Aborting: ' + requestData['url']);
          request.abort();
        }
        */
      };

      page.onLoadFinished = function () {
        // often never happens
        console.log('load finished');
      };

      page.onUrlChanged = function(targetUrl) {
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
          console.log('Prepare for load ldsorgjs');
          abortAll = true;
          page.onLoadFinished = function () {
            delete page.onLoadFinished;
            abortAll = false;
            console.log('directory load finished');
            if ('getMinData' === apiFn) {
              injectApiCall(['jquery-2.0.3.min.js']);
            } else {
              injectApiCall([
                'jquery-2.0.3.min.js'
              , 'ldsorg.pakmanaged.js'
              , 'IndexedDBShim.min.js'
              ]);
            }
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
  }, { parameters: { 'local-storage-path': path.join(__dirname, 'html5-storage'), 'disk-cache': 'true' } });
};
