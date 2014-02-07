'use strict';

var clients = require('./clientsdb');

exports.find = function(id, done) {
  if (!clients.some(function (client) {
    if (client.id === id) {
      done(null, client);
      return true;
    }
  })) {
    done(null, null);
  }
};

exports.findByClientId = function(clientId, done) {
  if (!clients.some(function (client) {
    if (client.clientId === clientId) {
      done(null, client);
      return true;
    }
  })) {
    done(null, null);
  }
};
