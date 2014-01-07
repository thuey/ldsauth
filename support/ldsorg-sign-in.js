function () {
  'use strict';

  var intToken
    , failCount = 0
    ;

  // NOTE: there's no success callback because on success
  // the page reloads and phantom's onUrlChanged event fires
  intToken = setInterval(function () {
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
      $('#submit').click();
    }, 1000);
  }, 100);
}
