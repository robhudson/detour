requirejs.config({
  baseUrl: '/static/js',
  enforceDefine: true,
  paths: {
    'jquery': '/static/js/lib/jquery',
    'nunjucks': '/static/js/lib/nunjucks'
  },
  shim: {
    'nunjucks': {
      exports: 'nunjucks'
    }
  }
});

define(['jquery', 'user', 'message', 'nunjucks'],
  function($, User, Message) {

  'use strict';

  var API_VERSION = '1.0';

  var env = new nunjucks.Environment();

  if(!nunjucks.env) {
      // If not precompiled, create an environment with an HTTP loader
      nunjucks.env = new nunjucks.Environment(new nunjucks.HttpLoader('/static/templates'));
  }

  var message = new Message();
  var user = new User();

  var nav = navigator.userAgent;

  var body = $('body');

  if (body.data('authenticated') === 'False') {
    body.find('#inner-wrapper').html(
      nunjucks.env.getTemplate('landing.html').render()
    );
  }

  var currentUser = localStorage.getItem('personaEmail');

  navigator.id.watch({
    loggedInUser: currentUser,
    onlogin: function (assertion) {
      body.find('#loading-overlay').fadeIn();
      $.ajax({
        type: 'POST',
        url: '/authenticate',
        data: { assertion: assertion },
        cache: false,
        success: function (res, status, xhr) {
          localStorage.setItem('personaEmail', res.email);
          $.get('/' + API_VERSION + '/messages/unread', function (resp) {
            body.find('#inner-wrapper').html(
              nunjucks.env.getTemplate('dashboard.html').render({
                messages: resp.data,
                email_notification: false // move to secondary call
              })
            );
          }).done(function () {
            body.find('#loading-overlay').fadeOut();
          });
        },
        error: function(res, status, xhr) {
          alert('login failure ' + res);
        }
      });
    },
    onlogout: function() {
      $.ajax({
        url: '/logout',
        type: 'POST',
        cache: false,
        success: function(res, status, xhr) {
          localStorage.removeItem('personaEmail');
          window.location.reload();
        },
        error: function(res, status, xhr) {
          console.log('logout failure ', res);
        }
      });
    }
  });

  // for now ... O_O
  var isInvalidFileInput = function () {
    return nav.match(/Mobile/i) && ((nav.match(/Firefox/i) &&
      nav.match(/Mobile/i) && !nav.match(/Android/i)));
  };

  body.on('click', function (ev) {
    var self = $(ev.target);

    var messageForm = $('#message-form');
    var contactsForm = $('#contacts-form');
    var notificationForm = $('#email-notification-form');
    var messageDetail = $('#message-detail');
    var contacts = $('#contacts');
    var messages = $('ol.messages');

    var insertContact = function (email) {
      messageForm.find('input[name="email"]').val(email);
      messageForm.find('#current-contact').text(email);
    };

    var clearFields = function () {
      messages.addClass('hidden');
      contacts.empty();
      contactsForm.find('#contact-status')
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
      messageForm.find('img').attr('src', '');
      contactsForm.addClass('hidden');
      messageForm.addClass('hidden');
      notificationForm.addClass('hidden');
      body.find('#preview-img')
          .attr('src', '')
          .addClass('hidden');
      body.removeClass('fixed');
    };

    switch (self.data('action')) {
      case 'login-persona':
        ev.preventDefault();
        navigator.id.request();
        break;

      case 'logout':
        ev.preventDefault();
        navigator.id.logout();
        break;

      case 'view':
        messages.addClass('hidden');
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
        messageForm.removeClass('hidden');
        message.clear();
        body.addClass('fixed');
        break;

      case 'contact-add':
        var email = self.data('email') || self.parent().data('email');
        insertContact(email);
        body.find('#message-body').addClass('hidden');
        messageForm.removeClass('hidden');
        message.clear();
        break;

      case 'contact-delete':
        user.deleteContact({ email: self.data('email') });
        self.closest('li').remove();
        break;

      case 'add-contact-form':
        clearFields();
        body.addClass('fixed');
        contactsForm.removeClass('hidden');
        notificationForm.removeClass('hidden');
        break;

      case 'new-message':
        body.addClass('fixed');
        contactsForm.addClass('hidden');
        notificationForm.addClass('hidden');
        messages.addClass('hidden');
        messageDetail.addClass('hidden');
        user.getContacts(nunjucks);
        break;

      case 'messages':
        contactsForm.addClass('hidden');
        notificationForm.addClass('hidden');
        messageDetail.addClass('hidden');
        messages.removeClass('hidden');
    }
  });

  if (isInvalidFileInput()) {
    body.addClass('file-disabled');
  }

  body.on('change', 'input[type="file"]', function (ev) {
    var img = $('#preview-img');
    var messageForm = $('#message-form');
    var files = ev.target.files;
    var file;

    if (files && files.length > 0) {
      file = files[0];

      var fileReader = new FileReader();

      fileReader.onload = function (evt) {
        img[0].onload = function () {
          messageForm.find('#image-width').val(img.width());
          messageForm.find('#image-height').val(img.height());
          img.removeClass('hidden');
        };

        img[0].src = evt.target.result;
      };

      fileReader.readAsDataURL(file);
    }
  });

  body.on('focus', 'textarea, input[type="text"]', function () {
    body.find('#message-status, #api-status, #contact-status, #email-notification-status').removeClass('on');
  });

  body.on('submit', 'form', function (ev) {
    var self = $(ev.target);

    switch (self[0].id) {
      case 'message-form':
        ev.preventDefault();
        body.find('#uploading-overlay').fadeIn();
        message.create();
        break;

      case 'contacts-form':
        ev.preventDefault();
        user.addContact(self.serialize());
        break;

      case 'email-notification-form':
        ev.preventDefault();
        user.addEmailNotification(self.serialize());
        break;
    }
  });
});
