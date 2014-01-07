(function () {
  'use strict';

  var ldsPhantom = require('./ldsorg-phantom')
    ;

  function test(username, password, done) {
    var session = {}
      ;

    console.log('try local login', username, !!password && 'password:true');
    ldsPhantom.callApi(
      function (err, sesh, id) {
        console.log('called the done function');
        if (err) {
          done(err);
          return;
        }

        session.username = sesh.username;
        session.password = sesh.password;
        session.phantom = sesh.phantom;
        session.page = sesh.page;
        session.emitter = sesh.emitter;

        if (!id) {
          done(new Error("couldn't retrieve id"));
          return;
        }

        session.id = id;
        done(null, session);
      }
    , { username: username
      , password: password
      , method: 'getCurrentUserId'
      , args: []
      }
    );
  }

  test('coolaj86', 'Wh1t3Ch3dd3r', function (err, meta, data) {
    if (err) { console.error(err); }
    console.log(meta);
    console.log(data);
  });
}());
