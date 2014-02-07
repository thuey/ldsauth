'use strict';

var fs = require('fs')
  , path = require('path')
  , dbpath = path.join(__dirname, 'authorizationcodesdb.json')
  , codes
  ;

try {
  codes = require(dbpath);
} catch(e) {
  codes = {};
}

exports.find = function(key, done) {
  var code = codes[key];
  done(null, code);
};

exports.save = function(code, values, done) {
  codes[code] = values;
  fs.writeFile(dbpath, JSON.stringify(codes, null, '  '), 'utf8', function () {
    done(null);
  });
};
