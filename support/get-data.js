function () {
  'use strict';

  var opts = __DIRECTIVE__
    , fns = {}
    ;

  fns.getMinData = function () {
    jQuery.get("https://www.lds.org/directory/services/ludrs/mem/current-user-id/", function (id) {
      jQuery.get("https://www.lds.org/directory/services/ludrs/unit/current-user-ward-stake/", function (_data) {
        var data = { event: 'done', currentUserId: id, currentUserWardStake: _data };
        window.callPhantom(data);
      });
    });
  };

  fns.getData = function (callbacks, method, args) {
    var LdsOrg = require('ldsorg')
      , ldsorg = LdsOrg.create()
      , fns = {}
      ;

    function getStuff() {
      console.log('getStuff');
      args.unshift(function (_ward) {
        window.callPhantom({ event: 'done', value: _ward, title: jQuery('title').text() }) ;
      });
      ldsorg[method].apply(ldsorg, args);
    }

    callbacks.forEach(function (key) {
      fns[key] = function () {
        window.callPhantom({ event: key, args: Array.prototype.slice(arguments, 0) });
      };
    });
    ldsorg.init(getStuff, fns);
  };

  fns[opts.fn].apply(null, opts.args || []);
}
