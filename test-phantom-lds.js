(function () {
  'use strict';

  var phantom = require('./phantom')
    , config = require('./config')
    ;

  phantom.testLogin(process.argv[2] || config.username, config.password, function (err, data) {
    if (err) {
      console.log(err);
    } else if (data) {
      console.log(data);
    } else {
      console.log("I got nothin'...");
    }
  });
}());
