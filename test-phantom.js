'use strict';

var phantom = require('node-phantom-simple')
  ;

phantom.create(function (err, ph) {
  console.log('created phantom instance');

  ph.createPage(function(err, page) {
    console.log('created page instance');

    function loadPouchDb() {
      page.injectJs('./IndexedDBShim.min.js', function (/*err*/) {
        page.injectJs('./pouchdb-nightly.min.js', function (/*err*/) {
          page.evaluate(function () {
            window.callPhantom('Pouch should be loaded...');
            new window.Pouch('test-db', function (err, db) {
              window.callPhantom('Pouch initialized successfully!');
              setTimeout(function () {
                db.get('BOGOID', function (err, data) {
                  if (err) {
                    window.callPhantom("item doesn't exist" + JSON.stringify(err));
                  } else if (data) {
                    window.callPhantom('item exists' + JSON.stringify(data));
                  }
                  window.callPhantom('saving an item...');
                  db.put({ _id: 'BOGOID', foo: 'bar', _rev: (data && (data.rev || data._rev)) }, function (err, data) {
                    window.callPhantom({ msg: 'saved a data item', error: err, data: data });
                    db.get('BOGOID', function (err, data) {
                      window.callPhantom({ code: 'exit', msg: 'got a data item', error: err, data: data });
                    });
                  });
                });
              }, 100);
            });

          }.toString(), function () {
          });
        });
      });
    }

    // Basically this is window.onerror
    page.onError = function (err) {
      console.error(err);
      ph.exit();
    };

    // fired on window.callPhantom except the first call from evaluateAsync
    page.onCallback = function (data) {
      if (data && 'exit' === data.code) {
        console.log('Kill Code Received');
        ph.exit();
      }
      console.log('CALLBACK: ' + JSON.stringify(data));
    };

    page.open('https://gist.github.com/', function (err, status) {
      console.log('opening page...');

      if (err || 'success' !== status) {
        console.log('err, status', err, status);
        ph.exit();
        return;
      }
    });

    page.onLoadFinished = function () {
      // often never happens
      console.log('load finished');
      testMessagePassing();
      loadPouchDb();
    };

    page.onUrlChanged = function(targetUrl) {
      console.log('New URL: ' + targetUrl);
    };

    function testMessagePassing() {
      // IMPORTANT: you must call `.toString()` on the first function
      // IMPORTANT: closure won't work, you must pass variables with `replace(/'TPL'/g, JSON.stringify(data))`
      // The first call to window.callPhantom will fire the evaluateAsync callback, all others fire page.onCallback
      page.evaluateAsync(function () {
        window.callPhantom("this is ignored" + 'MESSAGE'); // this will end the evaluateAsync, but will not pass parameters
        window.callPhantom("this is goes to 'onCallback'" + 'MESSAGE');
        window.callPhantom("this also goes to 'onCallback'" + 'MESSAGE');
      }.toString().replace(/'MESSAGE'/g, JSON.stringify("hello world")), function (err, data) {
        // this doesn't receive err on script error and doesn't receive data on data
        console.log('window.callPhantom called the first time:', data);
      });
    }

  });
}, { parameters: { 'local-storage-path': './html5-storage' } });
