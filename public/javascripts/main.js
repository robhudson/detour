'use strict';

requirejs.config({
  baseUrl: '/javascripts',
  enforceDefine: true,
  paths: {
    jquery: '/javascripts/jquery'
  }
});

define(['jquery', 'user', 'message', 'dither'],
  function($, User, Message, Dither) {

  var message = new Message();
  var user = new User();
  var dither = new Dither();

  var body = $('body');

  $.get('/landing', function (data) {
    body.find('#inner-wrapper').html(data);
  });

  body.on('click', function (ev) {
    var self = $(ev.target);

    var messageForm = $('#message-form');
    var contactsForm = $('#contacts-form');
    var messageDetail = $('#message-detail');
    var apiForm = $('#api-form');
    var contacts = $('#contacts');

    var insertContact = function (email) {
      messageForm.find('input[name="email"]').val(email);
      messageForm.find('#current-contact').text(email);
    };

    var clearFields = function () {
      contacts.empty();
      contactsForm.find('#contact-status')
        .empty()
        .removeClass('on');
      apiForm.find('#api-status')
        .empty()
        .removeClass('on');
      messageForm
        .find('#message-status, #current-contact')
        .empty()
        .removeClass('on');
      messageForm.find('textarea, input[name="email"]').val('');
      messageForm.find('input[name="dither"]')
        .attr('checked', false)
        .removeClass('on');
      messageForm.find('img').attr('src', '');
      apiForm.hide();
      contactsForm.hide();
      messageForm.hide();
      body.removeClass('fixed');
      dither.start = null;
      dither.clear();
      messageForm.find('.dither-toggle').removeClass('on');
      body.find('canvas').hide();
    };

    switch (self.data('action')) {
      // persona login
      case 'login-persona':
        ev.preventDefault();
        user.loginPersona();
        break;

      // facebook login
      case 'login-facebook':
        ev.preventDefault();
        user.loginFacebook();
        break;

      // logout
      case 'logout':
        ev.preventDefault();
        user.logout();
        break;

      case 'view':
        console.log('got here')
        message.view(self);
        break;

      case 'close':
        message.clear();
        break;

      case 'upload-photo':
        messageForm.find('input[type="file"]').click();
        break;

      case 'cancel':
        clearFields();
        break;

      case 'reply':
        messageForm.find('img').attr('src', '');
        messageForm.find('textarea, input[name="email"]').val('');
        messageForm.find('input[name="dither"]')
          .attr('checked', false)
          .removeClass('on');
        insertContact(message.currentContact);
        messageForm.show();
        message.clear();
        body.addClass('fixed');
        break;

      case 'contacts':
        user.getContacts();
        break;

      case 'contact-add':
        var email = self.data('email') || self.parent().data('email');
        insertContact(email);
        contacts.empty();
        messageForm.find('#message-status')
          .empty()
          .removeClass('on');
        message.clear();
        break;

      case 'contact-delete':
        user.deleteContact({ email: self.data('email'), _csrf: body.data('csrf') });
        self.closest('li').remove();
        break;

      case 'add-contact-form':
        body.addClass('fixed');
        messageForm.hide();
        messageDetail.hide();
        messageForm.find('input[name="email"], textarea, #current-contact').empty();
        contactsForm.fadeIn();
        apiForm.fadeIn();
        break;

      case 'new-message':
        body.addClass('fixed');
        apiForm.fadeOut();
        contactsForm.fadeOut();
        messageDetail.hide();
        messageForm.fadeIn();
        break;

      case 'dither':
        var canvas = $('#dither-preview');
        dither.ctx = canvas[0].getContext('2d');

        if (self.hasClass('on')) {
          self.removeClass('on');
          dither.start = null;
          dither.clear();
          dither.preview();
        } else {
          self.addClass('on');
          dither.start = window.mozAnimationStartTime || new Date().getTime()
          dither.run();
        }
        break;
    }
  });

  body.on('change', 'input[type="file"]', function (ev) {
    var photoMessage = $('textarea[name="photo_message"]');
    var canvas = $('#dither-preview');
    var messageForm = $('#message-form');

    var files = ev.target.files;
    var file;

    if (files && files.length > 0) {
      file = files[0];

      var fileReader = new FileReader();

      fileReader.onload = function (evt) {
        body.find('.dither-toggle').addClass('on');
        dither.form = messageForm;
        dither.currentSource = evt.target.result;
        dither.preview();
        canvas.show();

        photoMessage.val(evt.target.result);
      };

      fileReader.readAsDataURL(file);
    }
  });

  body.on('focus', 'textarea, input[type="text"]', function () {
    body.find('#message-status, #api-status, #contact-status').removeClass('on');
  });

  body.on('submit', 'form', function (ev) {
    ev.preventDefault();
    var self = $(ev.target);

    switch (self[0].id) {
      case 'message-form':
        message.send(self.serialize());
        dither.clear();
        break;

      case 'contacts-form':
        user.addContact(self.serialize());
        break;

      case 'api-form':
        user.addApiKey(self.serialize());
        break;
    }
  });
});
