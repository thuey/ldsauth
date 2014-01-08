module.exports.init = function (LdsDir, ldsDirP) {
  'use strict';

  var Join =  require('join')
    , forEachAsync =  require('forEachAsync')
    ;

  ldsDirP.cmps = {};
  ldsDirP.cmps.getHouseholdWithPhotos = function (fn, profileOrId, opts) {
    var join = Join.create()
      , me = this
      ;

    me.getHousehold(function (profile) {
      me.getFamilyPhoto(join.add(), profile, opts);
      me.getIndividualPhoto(join.add(), profile, opts);
      join.then(function () {
        me._emit('householdEnd', profile);
        fn(profile);
      });
    }, profileOrId);
  };


  // Family Photo can be fetched from ward directory or household
  ldsDirP.cmps.getFamilyPhoto = function (fn, profileOrId) {
    var me = this
      , jointProfile = profileOrId
      , familyPhotoUrl = jointProfile.householdInfo.photoUrl
      , familyImageId = jointProfile.householdInfo.imageId
      ;

    /*
    if (!familyPhotoUrl) {
      // this is the one from the ward photo list resource
      familyPhotoUrl = jointProfile.photoUrl;
      familyImageId = 'img-' + jointProfile.householdId;
    }
    */

    function onResult(data) {
      fn(data);
    }

    function saveHouseholdPhoto(err, dataUrl) {
      jointProfile.householdInfo.imageData = dataUrl;
      me._emit('householdPhoto', jointProfile, dataUrl || "");
      onResult(dataUrl);
    }
    
    // TODO calculate staleness of image link
    // and attempt to refetch household if it's stale
    // https://www.lds.org/directory/services/ludrs/mem/householdProfile/:head_of_household_id
    me._emit('householdPhotoInit', jointProfile);

    if (!familyPhotoUrl) {
      saveHouseholdPhoto();
      return;
    }

    me.store.get(familyImageId, function (err, data) {
      data = data || {};
      if ('string' === typeof data.result) {
        saveHouseholdPhoto(err, data.result);
        return;
      }
      LdsDir.getImageData(function (err, dataUrl) {
        data._id = familyImageId;
        data.result = dataUrl || "";
        me.store.put(data);

        saveHouseholdPhoto(err, dataUrl);
      }, familyPhotoUrl);
    });
  };

  // Individual Photo can be found in headOfHousehold info and from a special resource
  // https://www.lds.org/directory/services/ludrs/photo/url/#%7Bid_1%7D,:id_2,:id_x/individual
  ldsDirP.cmps.getIndividualPhoto = function (fn, profileOrId) {
    var me = this
      , individualPhotoUrl
      , individualImageId
        // TODO use special resouce to get individualPhotoId
      , jointProfile = profileOrId
      ;

    function onResult(data) {
      fn(data);
    }

    function saveIndividualPhoto(err, dataUrl) {
      jointProfile.headOfHousehold.imageData = dataUrl;
      me._emit('individualPhoto', jointProfile.headOfHousehold, dataUrl || "");
      onResult(dataUrl);
    }

    individualPhotoUrl = jointProfile.headOfHousehold.photoUrl;
    individualImageId = jointProfile.headOfHousehold.imageId;

    me._emit('individualPhotoInit', jointProfile);
    if (!individualPhotoUrl) {
      saveIndividualPhoto();
      return;
    }

    // TODO calculate staleness of image link
    // and attempt to use image fetch if it's stale
    // https://www.lds.org/directory/services/ludrs/photo/url/:id_1,:id_2,:id_x/individual
    me.store.get(individualImageId, function (err, data) {
      data = data || {};
      if ('string' === typeof data.result) {
        saveIndividualPhoto(err, data.result);
        return;
      }
      LdsDir.getImageData(function (err, dataUrl) {
        data._id = individualImageId;
        data.result = dataUrl || "";
        me.store.put(data);
        saveIndividualPhoto(err, dataUrl);
      }, individualPhotoUrl);
    });
  };


  ldsDirP.cmps.getWardOrganizations = function (fn, wardOrId, orgnames) {
    var me = this
      , ward
      , id
      , orgs = {}
      ;

    if (!Array.isArray(orgnames)) {
      orgnames = me._organizations.slice(0);
    }

    ward = LdsDir.mapId(wardOrId, 'wardUnitNo');
    id = ward.wardUnitNo;

    me._emit('wardOrganizationsInit', ward, orgnames);
    function gotAllOrgs() {
      me._emit('wardOrganizations', ward, orgs);
      fn(orgs);
    }

    forEachAsync(orgnames, function (next, orgname) {
      // UPPER_UNDERSCORE to camelCase
      var orgnameL = orgname
        .toLowerCase()
        .replace(/(_[a-z])/g, function($1){
          return $1.toUpperCase().replace('_','');
        });

      me.getWardOrganization(function (members) {
        members.organizationName = orgnameL;
        orgs[orgnameL] = members;
        next();
      }, ward, orgname, orgnameL);
    }).then(gotAllOrgs);
  };

  ldsDirP.cmps.getCurrentWardOrganizations = function (fn, orgnames) {
    this.getWardOrganizations(fn, this.homeWard, orgnames);
  };

  ldsDirP.cmps.getWardCallings = function (fn, ward) {
    var me = this
      ;

    me._emit('wardCallingsInit', ward);
    me.getWardPositions(function (_positions) {
      var positions = _positions.unitLeadership || _positions.wardLeadership
        , groups = []
        ;

      function gotAllWardCallings() {
        me._emit('wardCallings', ward, groups);
        fn(groups);
      }

      forEachAsync(positions, function (next, group) {
        me.getWardLeadership(function (list) {
          group.leaders = list.leaders;
          group.unitName = list.unitName;
          groups.push(group);
          next();
        }, ward, group);
      }).then(gotAllWardCallings);
    }, ward);
  };

  ldsDirP.cmps.getCurrentWardCallings = function (fn) {
    this.getWardCallings(fn, this.homeWard);
  };

  ldsDirP.cmps.getStakeCallings = function (fn, stake) {
    var me = this
      ;

    me._emit('stakeCallingsInit', stake);
    me.getStakePositions(function (_positions) {
      var positions = _positions.unitLeadership || _positions.stakeLeadership
        , groups = []
        ;

      function gotAllStakeCallings() {
        me._emit('stakeCallings', stake, groups);
        fn(groups);
      }

      forEachAsync(positions, function (next, group) {
        me.getStakeLeadership(function (list) {
          group.leaders = list.leaders;
          group.unitName = list.unitName;
          groups.push(group);
          next();
        }, stake, group);
      }).then(gotAllStakeCallings);
    }, stake);
  };
  ldsDirP.cmps.getCurrentStakeCallings = function (fn) {
    this.getStakeCallings(fn, this.homeStake);
  };

  // Household
  ldsDirP.cmps.getHouseholds = function (fn, _households) {
    _households = LdsDir.mapIds(_households, 'householdId');
    var me = this
      , households = []
      ;

    me._emit('householdsInit', _households);
    function gotOneHousehold(next, household) {
      me.getHousehold(function (_household) {
        households.push(_household);
        next();
      }, household);
    }

    forEachAsync(_households, gotOneHousehold).then(function () {
      me._emit('households', _households);
      fn(households);
    });
  };

  // TODO optionally include fresh pics
  // (but always include phone from photos)
  // TODO most of this logic should be moved to getHouseholds
  ldsDirP.cmps.getWard = function (fn, wardOrId, opts) {
    console.log('get ward');
    opts = opts || {};

    var me = this
      , join = Join.create()
      , ward
      , id
      , memberListId
      ;

    ward = LdsDir.mapId(wardOrId, 'wardUnitNo');
    id = ward.wardUnitNo;

    memberListId = id + '-ward';

    me._emit('wardInit', ward);
    function onWardResult(ward) {
      me._emit('wardEnd', ward);
      fn(ward);
    }

    function gotAllHouseholds(households) {
      // this is a merger, so no info is lost
      ward.households = households;
      onWardResult(ward);
    }

    function getWardRoles() {
      me.getWardCallings(function (callings) {
        ward.callings = callings;

        me.getWardOrganizations(function (orgs) {
          ward.organizations = orgs;

          me._emit('ward', ward);

          if (false === opts.fullHouseholds) {
            onWardResult(ward);
          } else {
            me.getHouseholds(gotAllHouseholds, ward.households);
          }
        }, ward);
      }, ward);
    }

    function getWardRoster() {
      me._getJSON(LdsDir.getMemberListUrl(id), join.add());
      me._getJSON(LdsDir.getPhotosUrl(id), join.add());

      join.then(function (memberListArgs, photoListArgs) {
        var memberList = memberListArgs[1]
          , photoList = photoListArgs[1]
          ;

        photoList.forEach(function (photo) {
          memberList.forEach(function (member) {
            if (photo.householdId !== member.headOfHouseIndividualId) {
              return;
            }

            // householdId
            // householdPhotoName
            // phoneNumber
            // photoUrl
            member.householdPhotoName = photo.householdName;
            delete photo.householdName;
            Object.keys(photo).forEach(function (key) {
              if (member[key]) {
                console.warn("member profile now includes '" + key + "', not overwriting");
              } else {
                member[key] = photo[key];
              }
            });
          });
        });

        ward.households = memberList;
        ward.updatedAt = Date.now();

        getWardRoles();
      });
    }

    getWardRoster();
  };

  ldsDirP.cmps.getStake = function (fn, stakeOrId, opts) {
    opts = opts || {};
    var me = this
      , stake
      , id
      ;

    // TODO find resource
    if ('object' !== typeof stakeOrId) {
      stakeOrId = me.stakes[stakeOrId] || { stakeUnitNo: stakeOrId };
    }
    stake = stakeOrId;
    id = stake.stakeUnitNo;

    me._emit('stakeInit', stake);

    function gotAllWards(wards) {
      stake.wards = wards || stake.wards;

      me._emit('stakeEnd', stake);
      fn(stake);
    }

    me.getStakeCallings(function (callings) {
      stake.callings = callings;

      me._emit('stake', stake);
      if (false === opts.wards) {
        gotAllWards();
      } else {
        me.getWards(gotAllWards, stake.wards, opts);
      }
    }, stake);
  };
  ldsDirP.cmps.getCurrentStake = function (fn, opts) {
    var me = this
      ;

    me.getStake(fn, me.homeStakeId, opts);
  };

  // wardsOrIds can be an array or map of wards or ids
  ldsDirP.cmps.getWards = function (fn, wardsOrIds, opts) {
    var me = this
      , wards = []
      ;

    function getOneWard(next, wardOrId) {
      function addWard(ward) {
        wards.push(ward);
        next();
      }
      me.getWard(addWard, wardOrId, opts);
    }

    wardsOrIds = LdsDir.toArray(wardsOrIds);
    forEachAsync(wardsOrIds, getOneWard).then(function () {
      fn(wards);
    });
  };

  // Current Stake
  ldsDirP.cmps.getCurrentMeta = function (fn) {
    var me = this
      //, areaInfoId = 'area-info'
      //, stakesInfoId = 'stakes-info'
      ;

    function onMetaResult(currentMeta, stakeList) {
      me._emit('meta', currentMeta);

      me.areas = {};
      me.wards = {};
      me.stakes = {};

      me.homeArea = {};

      me.homeAreaId = currentMeta.areaUnitNo;
      me.homeStakeId = currentMeta.stakeUnitNo;
      me.homeWardId = currentMeta.wardUnitNo;

      me.homeArea.areaUnitNo = currentMeta.areaUnitNo;
      me.homeArea.stakes = stakeList;
      me.homeAreaStakes = {};
      me.homeArea.stakes.forEach(function (stake) {
        me.homeAreaStakes[stake.stakeUnitNo] = stake;
        me.stakes[stake.stakeUnitNo] = stake;
      });
      // TODO me._emit('area', me.homeArea);

      me.homeStake = me.stakes[me.homeStakeId];
      me.homeStakeWards = {};
      me.homeStake.wards.forEach(function (ward) {
        me.homeStakeWards[ward.wardUnitNo] = ward;
      });
      Object.keys(me.stakes).forEach(function (stakeNo) {
        var stake = me.stakes[stakeNo]
          ;

        stake.wards.forEach(function (ward) {
          me.wards[ward.wardUnitNo] = ward;
        });
      });

      me.homeWard = me.wards[me.homeWardId];

      console.log('meta', currentMeta);
      fn(currentMeta);
    }

    me._getJSON(LdsDir.getCurrentMetaUrl(), function (err, areaInfo) {
      me._getJSON(LdsDir.getCurrentStakeUrl(), function (err2, stakes) {
        onMetaResult(areaInfo, stakes);
      });
    });
  };

  ldsDirP.cmps.getCurrentWard = function (fn, opts) {
    console.log('cur ward');
    var me = this
      ;

    me.getWard(fn, me.homeWardId, opts);
  };
};
