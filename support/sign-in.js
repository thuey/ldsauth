function () {
  'use strict';

  var intToken
    , failCount = 0
    ;

  intToken = setInterval(function () {
    window.callPhantom({ event: 'debug', msg: 'message' });
    if (failCount >= 10) {
      clearInterval(intToken);
      window.callPhantom({ event: 'error', error: 'failed a lot', failCount: failCount });
      return;
    }

    if (!window.jQuery || $('#submit').length !== 1) {
      failCount += 1;
      return;
    }

    clearInterval(intToken);
    setTimeout(function () {
      $('#username').val('__USERNAME__');
      $('#password').val('__PASSWORD__');
      //$('#loginForm').submit();
      window.callPhantom({ event: 'debug', failCount: failCount });
      $('#submit').click();
    }, 1000);
  }, 100);
}
