module.exports.init = function (LdsDir, ldsDirP) {
  'use strict';

  var request = require('request')
    ;

  ldsDirP.signin = function (cb, auth) {
    var me = this
      ;

    me.__jar = request.jar();
    request.post('https://signin.lds.org/login.html', {
      jar: me.__jar
    , form: {
        username: auth.username
      , password: auth.password
      }
    }, function (err, res, body) {
      if (err) {
        cb(err);
        return;
      }

      if (/SSO/.test(body)) {
        cb(new Error('Failed to authenticate. Check username / password'));
        return;
      }

      cb(null);
    });
  };

  ldsDirP.makeRequest = function (cb, url) {
    var me = this
      ;

    request.get(url, {
      jar: me.__jar
    }, function (err, res, body) {
      if (err) {
        cb(err);
        return;
      }

      cb(null, JSON.parse(body));
    });
  };

  ldsDirP.getImageData = function (next, imgSrc) {
    var me = this
      ;

    if (!imgSrc) {
      next(new Error('no imgSrc'));
      return;
    }

    request.get(imgSrc, { jar: me.__jar }, function (err, res, body) {
      next(err, body && body.toString('base64'));
    });
  };

  ldsDirP.initCache = function (ready) {
    var me = this
      ;

    me.___store = {};
    me.store = {
      get: function (id, cb) { setTimeout(function () { cb(null, me.___store[id]); }); }
    , put: function (data, cb) { me.___store[data._id] = data; if (cb) { cb(); } }
    , destroy: function (id, cb) { delete me.___store[id]; if (cb) { cb(); } }
    };

    ready();
  };

  ldsDirP.clear = function () {
    var me = this
      ;

    me.___store = {};
  };
};
