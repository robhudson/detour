'use strict';

requirejs.config({
  baseUrl: '/javascripts',
  enforceDefine: true,
  paths: {
    jquery: '/javascripts/jquery'
  }
});

define(['jquery', 'user', 'message'],
  function($, user, Message) {

  var message = new Message();

  var body = $('body');
  var form = body.find('form');

  body.on('click', function(ev) {
    var self = $(ev.target);

    switch (self.data('action')) {
      // persona login
      case 'login':
        ev.preventDefault();
        user.login();
        break;

      // persona logout
      case 'logout':
        ev.preventDefault();
        user.logout();
        break;

      case 'view':
        message.view(self);
        break;
    }
  });

  form.submit(function(ev) {
    ev.preventDefault();
    message.send($(this).serialize());
  });
});
