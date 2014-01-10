(function () {
  'use strict';

  var $ = require('jQuery')
    , LdsDir = require('ldsorg')
    , ldsDirP = LdsDir.prototype
    ;

  ldsDirP.signin = ldsDirP.signin = function (cb) {
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

  ldsDirP.makeRequest = function (cb, url) {
    $.ajax({
      url: url
    , dataType: "json"
    //, data: null
    //, success: success
    })
      .done(function (data) { cb(null, data); })
      .fail(function (jqXHR, textStatus, errorThrown) { cb(errorThrown, null); })
      ;
  };

  ldsDirP.getImageData = function (next, imgSrc) {
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
  };

  ldsDirP.initCache = function (cb) {
    var me = this
      ;

    function hasPouch(Pouch) {
      new Pouch('wardmenu-ludrs', function (err, db) {
        me.store = db;
        setTimeout(function () {
          console.log('pouch ready');
          cb();
        }, 100);
      });
    }

    try {
      hasPouch(require('Pouch'));
      return;
    } catch(e) {
      // ignore
    }

    $.get('http://thewardmenu.com/pouchdb-nightly.js', function (jsText) {
      // some crazy illegal token lint hack
      $(['<sc', 'ript>'].join('') + jsText + '</' + 'script' + '>').appendTo('body');
      var Pouch = require('Pouch');
      hasPouch(Pouch);
    }, 'text');
  };

  ldsDirP.clear = function () {
    var Pouch = require('Pouch');
    console.info('clearing PouchDB cache');
    Pouch.destroy('wardmenu-ludrs');
  };
}());