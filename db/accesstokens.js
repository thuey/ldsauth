'use strict';

var tokens = {}
  ;

exports.find = function(key, done) {
  var token = tokens[key];
  return done(null, token);
};

exports.save = function(token, values, done) {
  tokens[token] = values;
  return done(null);
};
