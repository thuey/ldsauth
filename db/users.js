'use strict';

var fs = require('fs')
  , UUID = require('node-uuid')
  , users
  , tmpUsers = {}
  ;

try {
  users = require('./usersdb.json');
} catch(e) {
  users = [
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

function shallowClone(user) {
  var clone = {}
    ;

  Object.keys(user).forEach(function (key) {
    clone[key] = user[key];
  });
  delete clone.password;
  delete clone.ldsorg;

  return clone;
}

exports.create = function (user, done) {
  var id = user.id
    , clone
    , tmpUser
    ;

  // some data only stored in-memory
  if (!tmpUsers[id]) {
    tmpUsers[id] = {};
  }
  tmpUser = tmpUsers[id];

  tmpUser.password = user.password;
  tmpUser.ldsorg = user.ldsorg;

  clone = shallowClone(user);

  exports.find(id, function (err, _user) {
    if (!_user) {
      users.push(clone);
      return;
    }
  });

  save(function (err) {   
    done(err, id);
  });
};

exports.find = function (id, done) {
  if (!users.some(function (user) {
    if (user.id === id) {
      user = shallowClone(user);
      user.password = tmpUsers[user.id].password;
      user.ldsorg = tmpUsers[user.id].ldsorg;
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
      user = shallowClone(user);
      user.password = tmpUsers[user.id].password;
      user.ldsorg = tmpUsers[user.id].ldsorg;
      done(null, user);
      return;
    }
  }
  return done(null, null);
};
