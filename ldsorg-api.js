(function () {
  "use strict";

  var ldsDirP
    , defaultKeepAlive = 1 * 24 * 60 * 60 * 1000
    ;

  function LdsDir() {
  }
  LdsDir.toArray = function (mapOrArr) {
    if (!Array.isArray(mapOrArr) && 'object' === typeof mapOrArr) {
      mapOrArr = Object.keys(mapOrArr).map(function (key) {
        return mapOrArr[key];
      });
    }
    return mapOrArr;
  };
  // LdsDir.mapIds(55555, 'wardUnitNo') // => { wardUnitNo: 55555 }
  LdsDir.mapId = function (objOrId, idName) {
    var obj = {}
      ;

    if ('object' === typeof objOrId) {
      //return objOrId;
      obj[idName] = objOrId[idName];
      return obj;
    }

    // assume string
    obj[idName] = objOrId;
    return obj;
  };
  // LdsDir.mapIds([55555], 'wardUnitNo') // => [{ wardUnitNo: 55555 }]
  LdsDir.mapIds = function (array, name) {
    /*
    if ('object' === typeof array[0]) {
      return array;
    }
    */

    return array.map(function (element) {
      var obj = {}
        ;

      //obj[name] = element;
      obj[name] = LdsDir.mapId(element, name);
      return obj;
    });
  };
  LdsDir._events = [
    "cacheInit"
  , "cacheReady"

  , "meta"
  //, "area"

  , "stakeInit"
  , "stakeCallingsInit"
  , "stakePositionsInit"
  , "stakePositions"
  , "stakeLeadershipInit"
  , "stakeLeadership"
  , "stakeCallings"
  , "stake"
    // gets wards
  , "stakeEnd"

  , "wardInit"
  , "wardCallingsInit"
  , "wardPositionsInit"
  , "wardPositions"
  , "wardLeadershipInit"
  , "wardLeadership"
  , "wardCallings"
  , "wardOrganizationsInit"
  , "wardOrganizationInit"
  , "wardOrganization"
  , "wardOrganizations"
  , "householdsInit"
  , "households"
    // gets households
  , "wardEnd"

  , "householdInit"
  , "household"
  , "householdPhotoInit"
  , "householdPhoto"
  , "individualPhotoInit"
  , "individualPhoto"
  , "householdEnd"
  ];
  LdsDir._urls = {};
  LdsDir._urls.base = 'https://www.lds.org/directory/services/ludrs';

  // https://www.lds.org/directory/services/ludrs/mem/householdProfile/:head_of_house_individual_id
  LdsDir._urls.household = '/mem/householdProfile/{{household_id}}';
  LdsDir.getHouseholdUrl = function (householdId) {
    return (LdsDir._urls.base
            + LdsDir._urls.household
                .replace(/{{household_id}}/g, householdId)
           );
  };

  // WARD CALLINGS
  // https://www.lds.org/directory/services/ludrs/1.1/unit/ward-leadership-positions/:ward_unit_no/true
  LdsDir._urls.wardLeadershipPositions = "/1.1/unit/ward-leadership-positions/{{ward_unit_no}}/true";
  LdsDir.getWardLeadershipPositionsUrl = function (wardUnitNo) {
    return (LdsDir._urls.base
            + LdsDir._urls.wardLeadershipPositions
                .replace(/{{ward_unit_no}}/g, wardUnitNo)
           );
  };
  // https://www.lds.org/directory/services/ludrs/1.1/unit/stake-leadership-group-detail/:ward_unit_no/:group_key/:instance
  LdsDir._urls.wardLeadershipGroup = "/1.1/unit/stake-leadership-group-detail/{{ward_unit_no}}/{{group_key}}/{{instance}}";
  LdsDir.getWardLeadershipGroupUrl = function (wardUnitNo, groupKey, instance) {
    return (LdsDir._urls.base
            + LdsDir._urls.wardLeadershipGroup
                .replace(/{{ward_unit_no}}/g, wardUnitNo)
                .replace(/{{group_key}}/g, groupKey)
                .replace(/{{instance}}/g, instance)
           );
  };
  // https://www.lds.org/directory/services/ludrs/1.1/unit/roster/:ward_unit_no/:organization
  LdsDir._urls.wardOrganization = "/1.1/unit/roster/{{ward_unit_no}}/{{organization}}";
  LdsDir.getWardOrganizationUrl = function (wardUnitNo, organization) {
    return (LdsDir._urls.base
            + LdsDir._urls.wardOrganization
                .replace(/{{ward_unit_no}}/g, wardUnitNo)
                .replace(/{{organization}}/g, organization)
           );
  };

  // STAKE CALLINGS
  // https://www.lds.org/directory/services/ludrs/1.1/unit/stake-leadership-positions/:stake_unit_no
  LdsDir._urls.stakeLeadershipPositions = "/1.1/unit/stake-leadership-positions/{{stake_unit_no}}";
  LdsDir.getStakeLeadershipPositionsUrl = function (stakeUnitNo) {
    return (LdsDir._urls.base
            + LdsDir._urls.stakeLeadershipPositions
                .replace(/{{stake_unit_no}}/g, stakeUnitNo)
           );
  };
  // https://www.lds.org/directory/services/ludrs/1.1/unit/stake-leadership-group-detail/:ward_unit_no/:group_key/:instance
  LdsDir._urls.stakeLeadershipGroup = "/1.1/unit/stake-leadership-group-detail/{{stake_unit_no}}/{{group_key}}/{{instance}}";
  LdsDir.getStakeLeadershipGroupUrl = function (stakeUnitNo, groupKey, instance) {
    return (LdsDir._urls.base
            + LdsDir._urls.stakeLeadershipGroup
                .replace(/{{stake_unit_no}}/g, stakeUnitNo)
                .replace(/{{group_key}}/g, groupKey)
                .replace(/{{instance}}/g, instance)
           );
  };
  // paste-url-here
  LdsDir._urls.currentStake = '/unit/current-user-units/';
  LdsDir.getCurrentStakeUrl = function () {
    return LdsDir._urls.base + LdsDir._urls.currentStake;
  };
  // paste-url-here
  LdsDir._urls.currentMeta = '/unit/current-user-ward-stake/';
  LdsDir.getCurrentMetaUrl = function () {
    return LdsDir._urls.base + LdsDir._urls.currentMeta;
  };
  // paste-url-here
  LdsDir._urls.currentUserId = '/mem/current-user-id/';
  LdsDir.getCurrentUserIdUrl = function () {
    return LdsDir._urls.base + LdsDir._urls.currentUserId;
  };
  // https://www.lds.org/directory/services/ludrs/mem/member-list/:ward_unit_number
  LdsDir._urls.memberList = '/mem/member-list/';
  LdsDir.getMemberListUrl = function (wardUnitNo) {
    return LdsDir._urls.base + LdsDir._urls.memberList + wardUnitNo;
  };
  // https://www.lds.org/directory/services/ludrs/mem/wardDirectory/photos/:ward_unit_number
  LdsDir._urls.photos = '/mem/wardDirectory/photos/';
  LdsDir.getPhotosUrl = function (wardUnitNo) {
    return LdsDir._urls.base + LdsDir._urls.photos + wardUnitNo;
  };


  // Prototype Stuff
  ldsDirP = LdsDir.prototype;

  // TODO abstract requests??
  // get cb, abstractUrl, { individualId: 123456 }, { cacheable: "cache://pic/:id", contentType: 'image' }
  // maybe use String.supplant?
  ldsDirP._getJSON = function (url, cb, opts) {
    opts = opts || {};
    // cacheUrl = opts.cacheUrl
    //    cache://members/:member_id/photo
    //    cache://households/:head_of_household_id/photo
    // cacheable = opts.preCache()
    // opts.noCache - don't cache at all
    // opts.expire - expire and force fetch
    var me = this
      , data
      , storeUrl = url.replace(/\//g, '-').replace(/:/g, '-')
      ;

    function respondWithCache(err, _data) {
      data = _data;
      var stale = true
        ;

      if (data) {
        stale = (Date.now() - opts.updatedAt) < (opts.keepAlive || defaultKeepAlive);
      }

      if (!(stale || opts.noCache || opts.expire)) {
        cb(null, data.value);
      } else {
        me.makeRequest(function (err, _data) {
          if (_data) {
            var obj = { _id: storeUrl, updatedAt: Date.now(), value: _data };
            obj._rev = (_data || {})._rev;
            if (!opts.noCache) {
              me.store.put(obj);
            }
          }
          cb(err, _data);
        }, url);
      }
    }

    function getCache() {
      // TODO cache here by url
      // TODO assume base
      me.store.get(storeUrl, respondWithCache);
    }

    getCache();
    //makeRequest();
  };

  // Organizations
  ldsDirP._organizations = [
    "HIGH_PRIEST"
  , "ELDER"
  , "RELIEF_SOCIETY"
  , "PRIEST"
  , "TEACHER"
  , "DEACON"
  , "LAUREL"
  , "MIA_MAID"
  , "BEEHIVE"
  , "ADULTS" // the lone plural organization
  ];

  ldsDirP.init = function (cb, eventer) {
    var me = this
      ;

    me._emit = eventer || function () {};

    me._emit('cacheInit');
    me.initCache(function () {
      me._emit('cacheReady');
      me.getCurrentMeta(cb);
    });
  };

  require('./ldsorg-api-core').init(LdsDir, ldsDirP);
  require('./ldsorg-api-composites').init(LdsDir, ldsDirP);
  function mergeApi(things) {
    Object.keys(things).forEach(function (key) {
      ldsDirP[key] = things[key];
    });
  }
  mergeApi(ldsDirP.apis);
  mergeApi(ldsDirP.cmps);

  LdsDir.create = function (opts) {
    opts = opts || {};

    if (opts.node) {
      require('./ldsorg-api-node').init(LdsDir, ldsDirP);
    } else if (opts.phantom) {
      require('./ldsorg-api-phantom').init(LdsDir, ldsDirP);
    } else {
      require('./ldsorg-api-browser').init(LdsDir, ldsDirP);
    }

    var ldsDir = Object.create(LdsDir.prototype)
      ;

    // TODO needs to be in an init function
    return ldsDir;
  };

  module.exports = LdsDir;
}());
