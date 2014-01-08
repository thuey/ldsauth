(function () {
  'use strict';

  function log(event, a, b, c, d) {
    console.log('[LOG]', event, a, b, c, d);
  }

  function getErDone() {
    ldsorg.getCurrentUserId(function (id) {
      console.log('got user id', id);
    });
  }

  var LdsOrg = require('./ldsorg-api')
    , ldsorg
    ;

  ldsorg = LdsOrg.create({ node: true });
  ldsorg.signin(
    function (err) {
      console.log('sign-in complete');
      if (err) {
        console.log('failed', err);
        return;
      }

      ldsorg.init(getErDone, log, { node: true });
    }
  , { username: process.argv[2], password: process.argv[3] }
  );
}());
