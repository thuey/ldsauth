'use strict';

var fs = require('fs')
  , UUID = require('node-uuid')
  , users
  ;

try {
  users = require('./usersdb.json');
} catch(e) {
  users = [
    { id: '1', username: 'bob', password: 'secret', name: 'Bob Smith' },
    { id: '2', username: 'joe', password: 'password', name: 'Joe Davis' }
  ];
}

function save(done) {
  fs.writeFileSync('./usersdb.json', JSON.stringify(users, function (key, value) {
    if ('username' === key || 'password' === value) {
      return;
    }
    return value;
  }, '  '), 'utf8');

  done(null);
}

exports.create = function (user, done) {
  exports.find(user.id, function (err, _user) {
    if (!_user) {
      users.push(user);
      return;
    }
  });

  save(function (err) {
    done(err, user.id);
  });
};

exports.find = function (id, done) {
  if (!users.some(function (user) {
    if (user.id === id) {
      done(null, user);
      return true;
    }
  })) {
    done(null, null);
  }
};

exports.findByUsername = function(username, done) {
  var i
    , user
    , len
    ;

  for (i = 0, len = users.length; i < len; i++) {
    user = users[i];
    if (user.username === username) {
      done(null, user);
      return;
    }
  }
  return done(null, null);
};
