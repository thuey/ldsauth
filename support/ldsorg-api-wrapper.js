(function () {
  'use strict';

  var emitter = new window.PhantomEmitter()
    , ldsorg = require('ldsorg').create()
    ;

  // a random doneEvent name is used so that the multiple
  // requests can be going on at the same time
  emitter.on('directive', function (doneEvent, method, args) {
    args.unshift(emitter.emit.bind(emitter, doneEvent));
    ldsorg[method].apply(ldsorg, args);
  });

  // as soon as ldsorg is init'ed it'll call 'ldsorgReady' back to node
  ldsorg.init(emitter.emit.bind(emitter, 'ldsorgReady'), emitter.emit.bind(emitter));
}());
