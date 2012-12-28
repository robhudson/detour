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
  var messageForm = body.find('#message-form');
  var contactsForm = body.find('#contacts-form');
  var messageDetail = $('#message-detail')
  var contacts = $('#contacts');

  var insertContact = function(email) {
    messageForm.find('input[name="email"]').val(email);
    messageForm.find('#current-contact').text(email);
    messageForm.find('textarea').focus();
  };

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

      case 'close':
        message.clear();
        break;

      case 'cancel':
        self.parent().fadeOut();
        contacts.empty();
        contactsForm.find('#contact-status').empty();
        messageForm.find('#message-status').empty();
        messageForm.find('#current-contact').empty();
        break;

      case 'reply':
        insertContact(self.parent().data('email'));
        messageForm.fadeIn();
        message.clear();
        break;

      case 'contacts':
        user.getContacts();
        break;

      case 'contact-add':
        var email = self.data('email') || self.parent().data('email');
        insertContact(email);
        contacts.empty();
        message.clear();
        break;

      case 'contact-delete':
        user.deleteContact({ email: self.data('email'), _csrf: body.data('csrf') });
        self.closest('li').remove();
        break;

      case 'add-contact-form':
        messageForm.hide();
        messageDetail.hide();
        messageForm.find('input[name="email"], textarea, #current-contact').empty();
        contactsForm.fadeIn();
        break;

      case 'new-message':
        contactsForm.hide();
        messageDetail.hide();
        messageForm.fadeIn();
        break;
    }
  });

  messageForm.submit(function(ev) {
    ev.preventDefault();
    message.send($(this).serialize());
  });

  contactsForm.submit(function(ev) {
    ev.preventDefault();
    user.addContact($(this).serialize());
  });
});
