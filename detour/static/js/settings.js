define(['jquery'],
  function ($) {

  'use strict';

  var statusTimer = function (status) {
    setTimeout(function () {
      status.removeClass('on');
    }, 2500); // milliseconds
  };

  return {
    body: $('body'),
    status: $('#status'),
    statusTimer: statusTimer,
    API_VERSION: '1.0',
    CHAR_MAX: 250,
    CONTACT_KEY: localStorage.getItem('personaEmail') + ':detourContacts',
    DEBUG: false
  };
});
