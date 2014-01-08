module.exports.init = function (LdsDir, ldsDirP) {
  'use strict';

  ldsDirP.apis = {};

  ldsDirP.apis.getCurrentUserId = function (fn) {
    var me = this
      ;

    console.log('getCurrentUserId');
    me._getJSON(LdsDir.getCurrentUserIdUrl(), function (err, _id) {
      me._emit('currentUserId', _id);
      fn(_id);
    });
  };

  // this is the only place to get email addresses for members without callings
  ldsDirP.apis.getHousehold = function (fn, profileOrId, opts) {
    opts = opts || {};

    var me = this
      //, jointProfile
      , id
      , profileId
      ;

    //jointProfile = LdsDir.mapId(profileOrId, 'householdId');
    id = profileOrId.householdId || profileOrId;
    profileId = 'profile-' + id;

    //me._emit('householdInit', jointProfile);
    me._emit('householdInit', id);

    function onResult(profile) {
      me._emit('household', profile);
      me._emit('householdEnd', profile);
      fn(profile);
    }

    function getFullHousehold(err, _profile) {
      onResult(_profile);
    }

    me._getJSON(LdsDir.getHouseholdUrl(id), getFullHousehold/*, { noCache: true }*/);
  };
  ldsDirP.apis.getWardOrganization = function (fn, ward, orgname, orgnameL) {
    var me = this
      ;

    me._emit('wardOrganizationInit', ward, orgnameL);
    me._getJSON(LdsDir.getWardOrganizationUrl(ward.wardUnitNo, orgname), function (err, orgs) {
      me._emit('wardOrganization', ward, orgnameL, orgs);
      fn(orgs);
    });
  };

  // WARD CALLINGS
  ldsDirP.apis.getWardPositions = function (fn, ward) {
    var me = this
      ;

    me._emit('wardPositionsInit', ward);
    me._getJSON(LdsDir.getWardLeadershipPositionsUrl(ward.wardUnitNo), function (err, positionsWrapped) {
      me._emit('wardPositions', ward, positionsWrapped);
      fn(positionsWrapped);
    });
  };
  ldsDirP.apis.getWardLeadership = function (fn, ward, group) {
    var me = this
      ;

    me._emit('wardLeadershipInit', ward, group);
    me._getJSON(
      LdsDir.getWardLeadershipGroupUrl(ward.wardUnitNo, group.groupKey, group.instance)
    , function (err, leadershipWrapped) {
        me._emit('wardLeadership', ward, group, leadershipWrapped);
        fn(leadershipWrapped);
      }
    );
  };

  // STAKE CALLINGS
  ldsDirP.apis.getStakePositions = function (fn, stake) {
    var me = this
      ;

    me._emit('stakePositionsInit', stake);
    me._getJSON(LdsDir.getStakeLeadershipPositionsUrl(stake.stakeUnitNo), function (err, data) {
      me._emit('stakePositions', stake, data);
      fn(data);
    });
  };
  ldsDirP.apis.getStakeLeadership = function (fn, stake, group) {
    var me = this
      ;

    me._emit('stakeLeadershipInit', stake, group);
    me._getJSON(
      LdsDir.getStakeLeadershipGroupUrl(stake.stakeUnitNo, group.groupKey, group.instance)
    , function (err, leadershipWrapped) {
        me._emit('stakeLeadership', stake, group, leadershipWrapped);
        fn(leadershipWrapped);
      }
    );
  };
};
