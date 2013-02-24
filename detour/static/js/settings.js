define(['jquery'],
  function ($) {

  'use strict';

  var STATUS_TTL = 2500; // milliseconds

  var statusTimer = function (status) {
    setTimeout(function () {
      status.removeClass('on');
    }, STATUS_TTL);
  };

  return {
    body: $('body'),
    status: $('#status'),
    statusTimer: statusTimer,
    API_VERSION: '1.0',
    CHAR_MAX: 250
  };
});
