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

  window.requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  var message = new Message();
  var user = new User();
  var dither = new Dither();

  var nav = navigator.userAgent;

  var body = $('body');

  $.get('/landing', function (data) {
    body.find('#inner-wrapper').html(data);
  });

  navigator.id.watch({
    onlogin: function(assertion) {
      body.find('#loading-overlay').fadeIn();
      $.ajax({
        url: '/persona/verify',
        type: 'POST',
        data: { assertion: assertion, _csrf: body.data('csrf') },
        dataType: 'json',
        cache: false
      }).done(function (data) {
        if (data.status === 'okay') {

          $.get('/landing', function (data) {
            body.find('#inner-wrapper').html(data);
            body.find('#loading-overlay').fadeOut();
          });
        }
      });
    },
    onlogout: function() {
      $.ajax({
        url: '/logout',
        type: 'POST',
        data: { _csrf: body.data('csrf') },
        dataType: 'json',
        cache: false
      }).done(function (data) {
        document.location.href = '/';
      });
    }
  });

  // for now ... O_O
  /*
  var isInvalidFileInput = function () {
    return nav.match(/Mobile/i) && ((nav.match(/Firefox/i) && nav.match(/Mobile/i) && !nav.match(/Android/i)));
  }
  */

  body.on('click', function (ev) {
    var self = $(ev.target);

    var messageForm = $('#message-form');
    var contactsForm = $('#contacts-form');
    var notificationForm = $('#email-notification-form');
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
      notificationForm.find('#email-notification-status')
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
      messageForm.find('.dither-toggle').removeClass('on');
      apiForm.hide();
      contactsForm.hide();
      messageForm.hide();
      notificationForm.hide();
      body.removeClass('fixed');
      dither.start = null;
      dither.clear();
      messageForm.find('.dither-toggle').removeClass('on');
      body.find('canvas').addClass('hidden');
    };

    switch (self.data('action')) {
      // persona login
      case 'login-persona':
        ev.preventDefault();
        navigator.id.request();
        break;

      case 'logout':
        ev.preventDefault();
        navigator.id.logout();
        user.logout();
        break;

      case 'view':
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
        clearFields();
        body.addClass('fixed');
        contactsForm.fadeIn();
        notificationForm.fadeIn();
        apiForm.fadeIn();
        break;

      case 'new-message':
        body.addClass('fixed');
        apiForm.fadeOut();
        contactsForm.fadeOut();
        notificationForm.fadeOut();
        messageDetail.hide();
        messageForm.fadeIn();
        break;
    }
  });

  /*
  if (isInvalidFileInput()) {
    body.addClass('file-disabled');
  }
  */

  body.on('change', 'input[type="file"]', function (ev) {
    var canvas = $('#dither-preview');
    var img = $('#dither-preview-img');
    var messageForm = $('#message-form');
    var files = ev.target.files;
    var file;

    if (files && files.length > 0) {
      file = files[0];

      var fileReader = new FileReader();

      fileReader.onload = function (evt) {
        body.find('.dither-toggle').addClass('on');

        img[0].onload = function () {
          messageForm.find('#image-width').val(img.width());
          messageForm.find('#image-height').val(img.height());
          img.removeClass('hidden');
        }

        img[0].src = evt.target.result;
      };

      fileReader.readAsDataURL(file);
    }
  });

  body.on('focus', 'textarea, input[type="text"]', function () {
    body.find('#message-status, #api-status, #contact-status, #email-notification-status').removeClass('on');
  });

  body.on('submit', 'form', function (ev) {
    ev.preventDefault();
    var self = $(ev.target);

    switch (self[0].id) {
      case 'message-form':
        body.find('#uploading-overlay').fadeIn();
        message.create();
        break;

      case 'contacts-form':
        user.addContact(self.serialize());
        break;

      case 'email-notification-form':
        user.addEmailNotification(self.serialize());
        break;
    }
  });
});
