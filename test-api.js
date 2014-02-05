'use strict';

var things = {};

$.get('/api/ldsorg/me', function (data) {
  var w
    , s
    , h
    ;

  console.log(data);
  things.meta = data;
  s = things.meta.currentUnits.stakeUnitNo;
  w = things.meta.currentUnits.wardUnitNo;
  h = things.meta.currentUserId;

  $.get('/api/ldsorg/stakes/' + s + '/wards/' + w + '/households/' + h, function (data) {
    console.log('household', data);
  });
  $.get('/api/ldsorg/stakes/' + s + '/wards/' + w + '/member-list', function (data) {
    console.log('member-list', data);
  });
  $.get('/api/ldsorg/stakes/' + s + '/wards/' + w + '/photo-list', function (data) {
    console.log('photo-list', data);
  });
  $.get('/api/ldsorg/stakes/' + s + '/wards/' + w + '/info', function (data) {
    console.log('info', data);
  });
  $.get('/api/ldsorg/stakes/' + s + '/wards/' + w + '/roster', function (data) {
    console.log('roster', data);
  });
});
$.get('/api/ldsorg/me/household', function (data) {
  console.log('household', data);
  things.household = data;
});
$.get('/api/ldsorg/me/ward', function (data) {
  console.log('ward', data);
  things.ward = data;
});
$.get('/api/ldsorg/me/stake', function (data) {
  console.log('stake', data);
  things.stake = data;
});
