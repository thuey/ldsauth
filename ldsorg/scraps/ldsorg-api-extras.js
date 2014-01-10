  function mergeHouseholdProfile(wardDirectoryProfile) {
      //jointProfile = LdsDir.mapId(profileOrId, 'householdId');
      id = jointProfile.householdId;

      function orThat(key) {
        if (jointProfile[key]) {
          console.warn("'" + key + "' already exists, not overwriting");
        } else {
          jointProfile[key] = _profile[key];
        }
      }

      // Object.keys(household)
      [ "canViewMapLink"
      , "hasEditRights"
      , "headOfHousehold"
      , "householdInfo"
      , "id"
      , "inWard"
      , "isEuMember"
      , "otherHouseholdMembers"
      //, "spouse"
      , "ward"
      ].forEach(function (key) {
        orThat(key);
      });

      jointProfile.householdSpouse = _profile.spouse;
  }

    ldsStakeP.getStake = function (fn, stakeOrId, opts) {
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
          me.getWards(gotAllWards, [], opts);
        }
      }, stake);
    };

    // Individual Photo can be found in headOfHousehold info and from a special resource
    // https://www.lds.org/directory/services/ludrs/photo/url/#%7Bid_1%7D,:id_2,:id_x/individual
    ldsWardP.getIndividualPhoto = function (fn, profileOrId) {
      var me = this
        , individualPhotoUrl
        , individualImageId
          // TODO use special resouce to get individualPhotoId
        , jointProfile = profileOrId
        ;

      function saveIndividualPhoto(err, dataUrl) {
        jointProfile.headOfHousehold.imageData = dataUrl;
        me._emit('individualPhoto', jointProfile.headOfHousehold, dataUrl || "");
        fn(dataUrl);
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
      me._store.get(individualImageId, function (err, data) {
        data = data || {};
        if ('string' === typeof data.result) {
          saveIndividualPhoto(err, data.result);
          return;
        }
        me.getImageData(
          function (err, dataUrl) {
            data._id = individualImageId;
            data.result = dataUrl || "";
            me._store.put(data);

            saveIndividualPhoto(err, dataUrl);
          }
        , { url: individualPhotoUrl 
          }
        );
      });
    };
    // Family Photo can be fetched from ward directory or household
    ldsWardP.getFamilyPhoto = function (fn, profileOrId) {
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

      me._store.get(familyImageId, function (err, data) {
        data = data || {};
        if ('string' === typeof data.result) {
          saveHouseholdPhoto(err, data.result);
          return;
        }
        me.getImageData(
          function (err, dataUrl) {
            data._id = familyImageId;
            data.result = dataUrl || "";
            me._store.put(data);

            saveHouseholdPhoto(err, dataUrl);
          }
        , { cacheId: familyImageId
          , url: familyPhotoUrl
          }
        );
      });
    };


            , photoMap = {}
            , memberMap = {}
          photoList.forEach(function (_photo) {
            photoMap[_photo.householdId] = _photo;
          });
          memberList.forEach(function (_member) {
            memberMap[_member.headOfHouseIndividualId];
          });
          photoList.forEach(function (_photo) {
            if (!memberMap[_photo.householdId]) {
              return;
            }

            var member = JSON.parse(JSON.stringify(_member))
              , photo = JSON.parse(JSON.stringify(_photo))
              ;

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

            roster.push(member);
          });

          me._emit('wardRoster', roster);


