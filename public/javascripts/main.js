'use strict';

requirejs.config({
  baseUrl: '/javascripts',
  enforceDefine: true,
  paths: {
    jquery: '/javascripts/jquery'
  }
});

define(['jquery', 'user', 'message'],
  function($, User, Message) {

  var message = new Message();
  var user = new User();

  var body = $('body');

  $.get('/landing', function (data) {
    body.find('#inner-wrapper').html(data);
  });

  body.on('click', function(ev) {
    var self = $(ev.target);

    var messageForm = $('#message-form');
    var contactsForm = $('#contacts-form');
    var messageDetail = $('#message-detail')
    var contacts = $('#contacts');

    var insertContact = function(email) {
      messageForm.find('input[name="email"]').val(email);
      messageForm.find('#current-contact').text(email);
      messageForm.find('textarea').focus();
    };

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
        messageForm
          .find('#message-status, #current-contact').empty();
        messageForm.find('textarea').val('');
        break;

      case 'reply':
        insertContact(message.currentContact);
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

  body.on('submit', 'form', function (ev) {
    ev.preventDefault();
    var self = $(ev.target);

    switch (self[0].id) {
      case 'message-form':
        message.send(self.serialize());
        break;

      case 'contacts-form':
        user.addContact(self.serialize());
        break;
    }
  });
});
