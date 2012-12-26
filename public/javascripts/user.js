'use strict';

define(['jquery'],
  function($) {

  var body = $('body');

  var self = {
    login: function() {
      navigator.id.get(function(assertion) {
        if (!assertion) {
          return;
        }

        $.ajax({
          url: '/persona/verify',
          type: 'POST',
          data: { assertion: assertion, _csrf: body.data('csrf') },
          dataType: 'json',
          cache: false
        }).done(function(data) {
          if (data.status === 'okay') {
            document.location.href = '/';
          } else {
            console.log('Login failed because ' + data.reason);
          }
        });
      });
    },

    logout: function() {
      $.ajax({
        url: '/persona/logout',
        type: 'POST',
        data: { _csrf: body.data('csrf') },
        dataType: 'json',
        cache: false
      }).done(function(data) {
        if (data.status === 'okay') {
          document.location.href = '/';
        } else {
          console.log('Logout failed because ' + data.reason);
        }
      });
    }
  };

  return self;
});
