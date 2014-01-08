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
