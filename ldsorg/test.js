(function () {
  'use strict';

  var fs = require('fs')
    , LdsOrg = require('./')
    , Cache = require('./cache').Cache
    , ldsorg
    , ts = Date.now()
    ;

  function log(event, a, b, c, d) {
    console.log('[LOG]', event);
  }

  function getErDone() {
    console.log('User Meta Data Gathered', ((Date.now() - ts) / 1000).toFixed(2) + 's');
    /*
    ldsorg.getHouseholdWithPhotos(function (data) {
      console.log(data);
    }, '5754908622', {});
    ldsorg.getCurrentUserId(function (id) {
      console.log('got user id', id);
    });
    */
    ldsorg.getCurrentStake().getAll(function () {
      console.log('got current stake', ((Date.now() - ts) / 1000).toFixed(2) + 's');
    });
    ldsorg.getCurrentStake().getCurrentWard().getAll(function () {
      console.log('got current ward', ((Date.now() - ts) / 1000).toFixed(2) + 's');
    });
  }

  ldsorg = LdsOrg.create({ node: true, Cache: Cache });
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