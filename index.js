'use strict';

var phantom = require('node-phantom-simple') // phantom, node-phantom, node-phantom-simple
  , config = require('./config') // TODO restful auth
  ;

phantom.create(function (err, ph) {
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
      }.toString().replace(/USERNAME/g, config.username).replace(/PASSWORD/g, config.password), function (err, stuff) {
          if (err) {
            console.log('Error at Sign-in');
            console.log(err);
            ph.exit();
            return;
          }

          console.log('submit complete, awaiting url change', stuff);
      }, config.username, config.password);
    }

    function loadLdsOrgJs() {
      setTimeout(function () {
        // wegt 'https://raw.github.com/LDSorg/ldsorgjs/master/ldsorg.pakmanaged.js'
        page.injectJs('./ldsorg.pakmanaged.js', function (/*err*/) {
        page.injectJs('./IndexedDBShim.min.js', function (/*err*/) {
          if (err) {
            console.log('inejectJs err', err);
            ph.exit();
            return;
          }

          console.log('Loading ward... this may take a while.');
          page.evaluateAsync(function () {
            var LdsOrg = require('ldsorg')
              , ldsorg = LdsOrg.create()
              ;

            function getStuff() {
              window.callPhantom('getStuff');
              console.log('getStuff');
              ldsorg.getCurrentWard(function (_ward) {
                window.callPhantom('gotStuff' + _ward);
                window.ward = { ward: _ward, blar: true, echo: false };
                //window.callPhantom('hello' + JSON.stringify({ ward: _ward, title: $('title').text() })) ;
                console.log("All Done!");
              }, { fullHouseholds: false });
            }

            ldsorg.init(getStuff, {
            /*
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
            */
            });
          }.toString(), function (err, stuff) {
            if (err) {
              console.log('Error');
              console.log(err);
            }
            console.log('all the things 0', stuff);
            /*
            page.evaluate(function () {
              return 'hello world' + JSON.stringify(window.ward);
            }, function (err, stuff) {
              if (err) {
                console.log('Error');
                console.log(err);
              }
              console.log('all the things 1', stuff);
            });
            */
          });
        });
        });
      }, 1000);
    }

    page.onResourceRequested = function(requestData, request) {
      console.log('Requesting "', requestData[0].url.substr(0, 100), '"', requestData.length);
      if (false) {
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
      if (targetUrl === 'https://signin.lds.org/SSOSignIn/') {
        console.log('Prepare for sign in');
        page.onLoadFinished = function () {
          // often never happens
          delete page.onLoadFinished;
          console.log('sign-in load finished');
          signIn();
        };
      } else if (true) {
        console.log('Prepare for load ldsorgjs');

        page.onLoadFinished = function () {
          delete page.onLoadFinished;
          console.log('directory load finished');
          loadLdsOrgJs();
        };
      }
    };

    page.onCallback = function(data) {
      console.log('CALLBACK: ' + JSON.stringify(data));  // Prints 'CALLBACK: { "hello": "world" }'
    };

    page.onConsoleMessage = function () {
      console.log(arguments);
    };

    page.open('https://www.lds.org/directory', function (err, status) {
      console.log('opening page...');

      if (err || 'success' !== status) {
        console.log('err, status', err, status);
        ph.exit();
        return;
      }

      /*
      setTimeout(function () {
        signIn();
      }, 2000);
      */

    });
  });
}, { parameters: { 'local-storage-path': './html5-storage' } });
