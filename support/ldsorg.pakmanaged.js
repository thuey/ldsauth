var global = Function("return this;")();
/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);
// pakmanager:ldsorg/join
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  (function () {
      "use strict";
    
      // Poor Man's Join
      var Join = {
        create: function () {
          var things = []
            , len = Infinity
            , fn
            , complete = 0
            ;
    
          return {
              then: function (_fn) {
                fn = _fn;
                len = things.length;
                if (complete === len) {
                  fn.apply(null, things);
                }
              }
            , add: function () {
                var i = things.length
                  ;
    
                things[things.length] = null;
    
                return function () {
                  var args = [].slice.call(arguments)
                    ;
    
                  complete += 1;
                  things[i] = args;
                  if (fn && (complete === len)) {
                    fn.apply(null, things);
                  }
                };
              }
          };
        }
      };
    
      module.exports = Join;
    }());
    
  provide("ldsorg/join", module.exports);
}(global));

// pakmanager:ldsorg/forEachAsync
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  // Part of FuturesJS. See https://github.com/FuturesJS/forEachAsync
    /*jshint -W054 */
    (function (exports) {
      "use strict";
    
      function forEachAsync(arr, fn, thisArg) {
        var done
          , index = -1
          ;
    
        function next(BREAK) {
          if (0 === arr.length || BREAK === forEachAsync.BREAK) {
            if ('undefined' !== typeof thisArg) {
              done.call(thisArg);
            } else {
              done(thisArg);
            }
            return;
          }
    
          index += 1;
          if ('undefined' !== typeof thisArg) {
            fn.call(thisArg, next, arr.shift(), index, arr);
          } else {
            fn(next, arr.shift(), index, arr);
          }
        }
    
        setTimeout(next, 4);
    
        return {
          then: function (_done) {
            done = _done;
          }
        };
      }
      forEachAsync.BREAK = {};
    
      exports = forEachAsync.forEachAsync = forEachAsync;
      if ('undefined' !== module) {
        module.exports = forEachAsync;
      }
    }('undefined' !== typeof exports && exports || new Function('return this')()));
    
  provide("ldsorg/forEachAsync", module.exports);
}(global));

// pakmanager:ldsorg
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  (function () {
      "use strict";
    
      var $ = require('jQuery')
        , Join =  require('ldsorg/join')
        , forEachAsync =  require('ldsorg/forEachAsync')
        , ldsDirP
        , defaultKeepAlive = 1 * 24 * 60 * 60 * 1000
        ;
    
      function getImageData(next, imgSrc) {
        if (!imgSrc) {
          next(new Error('no imgSrc'));
          return;
        }
    
        var img
          ;
    
        img = document.createElement('img');
        img.onload = function () {
          var c = document.createElement('canvas')
            , c2d = c.getContext('2d')
            ;
    
          c.height = this.height;
          c.width = this.width;
          c2d.drawImage(this, 0,0);
    
          next(null, c.toDataURL('image/jpeg'));
        };
    
        img.onerror = function(){
          next(new Error("Didn't load image"));
        };
    
        img.src = imgSrc;
      }
    
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
        if ('object' === typeof objOrId) {
          return objOrId;
        }
    
        var obj = {}
          ;
    
        obj[idName] = objOrId;
        return obj;
      };
      // LdsDir.mapIds([55555], 'wardUnitNo') // => [{ wardUnitNo: 55555 }]
      LdsDir.mapIds = function (array, name) {
        if ('object' === typeof array[0]) {
          return array;
        }
    
        array.map(function (element) {
          var obj = {}
            ;
    
          obj[name] = element;
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
        // opts.noCache
        var me = this
          , data
          , storeUrl = url.replace(/\//g, '-').replace(/:/g, '-')
          ;
    
        function getCache() {
          // TODO cache here by url
          // TODO assume base
          me.store.get(storeUrl, function (err, _data) {
            data = _data;
            var stale = true
              ;
    
            if (data) {
              stale = (Date.now() - opts.updatedAt) < (opts.keepAlive || defaultKeepAlive);
            }
    
            if (!stale) {
              cb(null, data.stuff);
            } else {
              makeRequest();
            }
          });
        }
    
        function putCache(data) {
          var obj = { _id: storeUrl, updatedAt: Date.now(), stuff: data };
          obj._rev = (data || {})._rev;
          me.store.put(obj);
        }
    
        function makeRequest() {
          $.ajax({
            url: url
          , dataType: "json"
          //, data: null
          //, success: success
          })
            .done(function (data) {
              putCache(data);
              cb(null, data);
            })
            .fail(function (jqXHR, textStatus, errorThrown) { cb(errorThrown, null); });
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

        function hasPouch(Pouch) {
          /*
          function n() {}
          me.___store = {};
          me.store = {
            get: function (id, cb) { setTimeout(function () { cb(null, me.___store[id]); }); }
          , put: function (data) { me.___store[data._id] = data; }
          , destroy: n
          };

          setTimeout(function () {
            me._emit('cacheReady');
            me.getCurrentMeta(cb);
          }, 100);
          return;
          */
          ///*
          new Pouch('wardmenu-ludrs', function (err, db) {
            me.store = db;
            setTimeout(function () {
              me._emit('cacheReady');
              console.log('pouch ready');
              me.getCurrentMeta(cb);
            }, 100);
          });
          //*/
        }

        try {
          hasPouch(require('Pouch'));
          return;
        } catch(e) {
          // ignore
        }

        $.get('http://thewardmenu.com/pouchdb-nightly.js', function (jsText) {
          // some crazy illegal token hack
          $(['<sc', 'ript>'].join('') + jsText + '</' + 'script' + '>').appendTo('body');
          var Pouch = require('Pouch');
          hasPouch(Pouch);
        }, 'text');
      };
    
      ldsDirP.getCurrentUserId = function (fn) {
        console.log('getCurrentUserId');
        me._getJSON(LdsDir.getCurrentUserIdUrl(), function (err, _id) {
          emitter.emit('currentUserId', _id);
          fn(_id);
        });
      };

      ldsDirP.getHousehold = function (fn, profileOrId) {
        var me = this
          , jointProfile
          , id
          , profileId
          , familyPhotoUrl
          , individualPhotoUrl
          , familyImageId
          , individualImageId
          ;
    
        profileId = 'profile-' + id;
        jointProfile = LdsDir.mapId(profileOrId, 'householdId');
        id = jointProfile.householdId;
    
        me._emit('householdInit', jointProfile);
    
        function onResult(profile) {
          me._emit('householdEnd', profile);
    
          fn(profile);
        }
    
        me._getJSON(LdsDir.getHouseholdUrl(id), function (err, _profile) {
          var join = Join.create()
            , famCb
            , indCb
            ;
    
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
    
          me._emit('household', jointProfile);
    
          function saveProfile() {
            onResult(jointProfile);
          }
    
          individualPhotoUrl = jointProfile.headOfHousehold.photoUrl;
          individualImageId = jointProfile.headOfHousehold.imageId;
          familyPhotoUrl = jointProfile.householdInfo.photoUrl;
          familyImageId = jointProfile.householdInfo.imageId;
    
          if (!familyPhotoUrl) {
            // this is the one from the ward photo list resource
            familyPhotoUrl = jointProfile.photoUrl;
            familyImageId = 'img-' + jointProfile.householdId;
          }
    
          function saveHouseholdPhoto(err, dataUrl) {
            jointProfile.householdInfo.imageData = dataUrl;
            me._emit('householdPhoto', jointProfile, dataUrl || "");
            famCb();
          }
          
          function saveIndividualPhoto(err, dataUrl) {
            jointProfile.headOfHousehold.imageData = dataUrl;
            me._emit('individualPhoto', jointProfile.headOfHousehold, dataUrl || "");
            indCb();
          }
    
          // TODO calculate staleness of image link
          // and attempt to refetch household if it's stale
          // https://www.lds.org/directory/services/ludrs/mem/householdProfile/:head_of_household_id
          if (familyPhotoUrl) {
            famCb = join.add();
            me._emit('householdPhotoInit', jointProfile);
            me.store.get(familyImageId, function (err, data) {
              data = data || {};
              if ('string' === typeof data.result) {
                saveHouseholdPhoto(err, data.result);
                return;
              }
              getImageData(function (err, dataUrl) {
                data._id = familyImageId;
                data.result = dataUrl || "";
                me.store.put(data);
    
                saveHouseholdPhoto(err, dataUrl);
              }, familyPhotoUrl);
            });
          }
          // TODO calculate staleness of image link
          // and attempt to use image fetch if it's stale
          // https://www.lds.org/directory/services/ludrs/photo/url/:id_1,:id_2,:id_x/individual
          if (individualPhotoUrl) {
            indCb = join.add();
            me._emit('individualPhotoInit', jointProfile);
            me.store.get(individualImageId, function (err, data) {
              data = data || {};
              if ('string' === typeof data.result) {
                saveIndividualPhoto(err, data.result);
                return;
              }
              getImageData(function (err, dataUrl) {
                data._id = individualImageId;
                data.result = dataUrl || "";
                me.store.put(data);
                saveIndividualPhoto(err, dataUrl);
              }, individualPhotoUrl);
            });
          }
    
          join.then(function () {
            saveProfile();
          });
        });
      };
    
      ldsDirP.getWardOrganization = function (fn, ward, orgname, orgnameL) {
        var me = this
          ;
    
        me._emit('wardOrganizationInit', ward, orgnameL);
        me._getJSON(LdsDir.getWardOrganizationUrl(ward.wardUnitNo, orgname), function (err, orgs) {
          me._emit('wardOrganization', ward, orgnameL, orgs);
          fn(orgs);
        });
      };
      ldsDirP.getWardOrganizations = function (fn, wardOrId, orgnames) {
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
      ldsDirP.getCurrentWardOrganizations = function (fn, orgnames) {
        this.getWardOrganizations(fn, this.homeWard, orgnames);
      };
    
      // WARD CALLINGS
      ldsDirP.getWardPositions = function (fn, ward) {
        var me = this
          ;
    
        me._emit('wardPositionsInit', ward);
        me._getJSON(LdsDir.getWardLeadershipPositionsUrl(ward.wardUnitNo), function (err, positionsWrapped) {
          me._emit('wardPositions', ward, positionsWrapped);
          fn(positionsWrapped);
        });
      };
      ldsDirP.getWardLeadership = function (fn, ward, group) {
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
      ldsDirP.getWardCallings = function (fn, ward) {
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
      ldsDirP.getCurrentWardCallings = function (fn) {
        this.getWardCallings(fn, this.homeWard);
      };
    
      // STAKE CALLINGS
      ldsDirP.getStakePositions = function (fn, stake) {
        var me = this
          ;
    
        me._emit('stakePositionsInit', stake);
        me._getJSON(LdsDir.getStakeLeadershipPositionsUrl(stake.stakeUnitNo), function (err, data) {
          me._emit('stakePositions', stake, data);
          fn(data);
        });
      };
      ldsDirP.getStakeLeadership = function (fn, stake, group) {
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
      ldsDirP.getStakeCallings = function (fn, stake) {
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
      ldsDirP.getCurrentStakeCallings = function (fn) {
        this.getStakeCallings(fn, this.homeStake);
      };
    
      // Household
      ldsDirP.getHouseholds = function (fn, _households) {
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
      ldsDirP.getWard = function (fn, wardOrId, opts) {
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
    
      ldsDirP.getStake = function (fn, stakeOrId, opts) {
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
      ldsDirP.getCurrentStake = function (fn, opts) {
        var me = this
          ;
    
        me.getStake(fn, me.homeStakeId, opts);
      };
    
      // wardsOrIds can be an array or map of wards or ids
      ldsDirP.getWards = function (fn, wardsOrIds, opts) {
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
      ldsDirP.getCurrentMeta = function (fn) {
        var me = this
          , areaInfoId = 'area-info'
          , stakesInfoId = 'stakes-info'
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
    
      ldsDirP.getCurrentWard = function (fn, opts) {
        console.log('cur ward');
        var me = this
          ;
    
        me.getWard(fn, me.homeWardId, opts);
      };
      ldsDirP.clear = function () {
        var Pouch = require('Pouch');
        console.info('clearing PouchDB cache');
        Pouch.destroy('wardmenu-ludrs');
      };
    
      LdsDir.signin = ldsDirP.signin = function (cb) {
        // TODO use iframe
        var //me = this
            signinWin
          //, url = "https://signin.lds.org/SSOSignIn/"
          , url = 'https://www.lds.org/directory/'
          , name = "WardMenuLdsOrgSignin"
          , opts = 'height=600,width=500,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no'
          ;
    
        function closeSigninWin() {
          if (!signinWin) {
            return;
          }
    
          try {
            signinWin.close();
          } catch(e) {
            // do nothing
            console.warn('Tried to close a closed window (the signin window, to be precise).');
          }
        }
    
        function openAuthWin(ev) {
          ev.preventDefault();
          ev.stopPropagation();
    
          closeSigninWin();
          signinWin = window.open(url, name, opts, false);
          setTimeout(getLoginStatus, 4000);
        }
    
        function getLoginStatus() {
          var $events = $('body')
            ;
    
          $.ajax({
              //url: me._ludrsUserId
              url: 'https://www.lds.org/directory/'
            , success: function () {
                $('.js-login').hide();
                $events.off('click', '.js-signin-link', openAuthWin);
                closeSigninWin();
                console.log('finally authenticated');
                cb(true);
              }
            , error: function () {
                console.log('waiting for authentication...');
                if (!signinWin) {
                  $('.js-login').show();
                  $events.on('click', '.js-signin-link', openAuthWin);
                } else {
                  setTimeout(getLoginStatus, 1000);
                }
              }
          });
        }
    
        getLoginStatus();
      };
    
      LdsDir.create = function () {
        var ldsDir = Object.create(LdsDir.prototype)
          ;
    
        // TODO needs to be in an init function
        return ldsDir;
      };
    
      module.exports = LdsDir;
    }());
    
  provide("ldsorg", module.exports);
}(global));
