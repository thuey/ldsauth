(function () {
  'use strict';

  var fs = require('fs')
    , LdsOrg = require('./ldsorg-api')
    , ldsorg
    ;

  function log(event, a, b, c, d) {
    console.log('[LOG]', event);
  }

  function getErDone() {
    ldsorg.getHouseholdWithPhotos(function (data) {
      console.log(data);
    }, '5754908622', {});
    /*
    ldsorg.getCurrentUserId(function (id) {
      console.log('got user id', id);
    });
    ldsorg.getCurrentWard(function (data) {
      console.log('got current ward');
      fs.writeFileSync('./test.json', JSON.stringify(data, null, '  '), 'utf8');
    });
    */
  }

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
