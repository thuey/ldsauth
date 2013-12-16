'use strict';

var phantom = require('node-phantom-simple')
  , path = require('path')
  , simplestUrl = 'https://www.lds.org/directory/services/ludrs/mem/current-user-id/'
  , ssoUrl = 'https://signin.lds.org/SSOSignIn/'
  , errorUrl = 'https://signin.lds.org/SSOSignIn/?error=authfailed'
  ;

module.exports.testLogin = function (username, password, done) {
  phantom.create(function (err, ph) {
    var abortAll = true
      ;

    function fin(err, data) {
      done(err, data);
      setTimeout(function () {
        ph.exit();
      });
    }

    console.log('created phantom instance');
    ph.createPage(function(err, page) {
      console.log('created page instance');

      function signIn() {
        console.log('attempting sign in');

        page.evaluateAsync(function () {
          var intToken
            , failCount = 0
            ;

          intToken = setInterval(function () {
            window.callPhantom('message');
            if (failCount >= 10) {
              clearInterval(intToken);
              window.callPhantom({ error: 'failed a lot', failCount: failCount });
              return;
            }

            if (!window.jQuery || $('#submit').length !== 1) {
              failCount += 1;
              return;
            }

            clearInterval(intToken);
            setTimeout(function () {
              $('#username').val('USERNAME');
              $('#password').val('PASSWORD');
              //$('#loginForm').submit();
              window.callPhantom({ failCount: failCount });
              $('#submit').click();
            }, 1000);
          }, 100);
        }.toString().replace(/USERNAME/g, username).replace(/PASSWORD/g, password)
      , function (err, stuff) {
            if (err) {
              console.log('Error at Sign-in');
              console.log(err);
              ph.exit();
              return;
            }

            console.log('submit complete, awaiting url change', stuff);
        });
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

      function getMinData() {
        page.injectJs(path.join(__dirname, 'support', 'jquery-2.0.3.min.js'), function (/*err*/) {
          page.evaluate(function () {
              jQuery.get("https://www.lds.org/directory/services/ludrs/mem/current-user-id/", function (id) {
                jQuery.get("https://www.lds.org/directory/services/ludrs/unit/current-user-ward-stake/", function (data) {
                  window.callPhantom({ event: 'done', currentUserId: id, currentUserWardStake: data });
                });
              });
            }.toString()
          , function () {
            console.log('gotMinData');
          });
        });
      }

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
            getMinData();
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
