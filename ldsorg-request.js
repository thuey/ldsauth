'use strict';

var request = require('request')
  ;

function getJson(url, cb) {
  request.get(url, {
    jar: true
  }, function (err, res, body) {
    if (err) {
      cb(err);
      return;
    }

    cb(null, body);
  });
}

function signin(cb, auth) {
  request.post('https://signin.lds.org/login.html', {
    jar: true
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
}

signin(function (err) {
  if (err) {
    console.log('failed', err);
    return;
  }

  getJson(function (err, data) {
    console.log(err, data);
  }, 'https://www.lds.org/directory/services/ludrs/mem/current-user-id/');
}, { username: process.argv[2], password: process.argv[3] });
