requirejs.config({
  enforceDefine: true,
  paths: {
    'jquery': 'lib/jquery',
    'nunjucks': 'lib/nunjucks'
  },
  shim: {
    'jquery': {
      exports: 'jQuery'
    },
    'nunjucks': {
      exports: 'nunjucks'
    }
  }
});

define(['jquery', 'user', 'message', 'settings', 'nunjucks'],
  function($, User, Message, settings, nunjucks) {

  'use strict';

  var env = new nunjucks.Environment();

  if(!nunjucks.env) {
      // If not precompiled, create an environment with an HTTP loader
      nunjucks.env = new nunjucks.Environment(new nunjucks.HttpLoader('/static/templates'));
  }

  var message = new Message();
  var user = new User();

  var nav = navigator.userAgent;

  var body = settings.body;
  var CHAR_MAX = settings.CHAR_MAX;

  var checkCharLimit = function (text) {
    var textLength = text.length;
    var charLimit = $('#char-limit');

    if (textLength > CHAR_MAX) {
      charLimit.addClass('over');
      charLimit.text('- ' + (textLength - CHAR_MAX));
    } else {
      charLimit.removeClass('over');
      charLimit.text(CHAR_MAX - textLength);
    }
  };

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
          body.find('#inner-wrapper').html(
            nunjucks.env.getTemplate('dashboard.html').render()
          );
          message.getAll();
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

  body.on('keyup', 'textarea', function (ev) {
    checkCharLimit($(this).val());
  });

  body.on('click', function (ev) {
    var self = $(ev.target);

    var messageForm = $('#message-form');
    var settingsForm = $('#settings');
    var messageDetail = $('#message-detail');
    var contacts = $('#contacts');
    var messages = $('ol.messages');
    var messageBody = $('#message-body');

    var insertContact = function (email, avatar) {
      messageForm.find('input[name="email"]').val(email);
      messageForm.find('#current-contact')
        .text(email)
        .prepend('<img src="' + avatar + '" class="avatar">');
    };

    var clearFields = function () {
      messageBody.empty();
      messages.addClass('hidden');
      contacts
        .addClass('hidden')
        .empty();
      messageForm
        .find('textarea, input[name="email"]')
        .val('');
      messageForm
        .find('img')
        .attr('src', '');
      settingsForm.addClass('hidden');
      messageForm.addClass('hidden');
      body
        .find('#preview-img')
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
        body.find('#messages-inbox').click();
        break;

      case 'upload-photo':
        messageForm.find('input[type="file"]').click();
        break;

      case 'cancel':
        clearFields();
        body.find('#messages-inbox').click();
        break;

      case 'reply':
        clearFields();
        insertContact(message.currentContact, message.currentAvatar);
        messageForm.removeClass('hidden');
        message.clear();
        body.addClass('fixed');
        break;

      case 'contact-add':
        var email = self.data('email') || self.parent().data('email');
        var avatar = self.data('avatar') || self.parent().data('avatar');
        insertContact(email, avatar);
        body
          .find('#message-body')
          .addClass('hidden');
        messageForm.removeClass('hidden');
        message.clear();
        break;

      case 'contact-delete':
        var userId = self.data('id') || self.parent().data('id');
        user.deleteContact(parseInt(userId, 10));
        self.closest('li').remove();
        break;

      case 'settings-form':
        clearFields();
        body.addClass('fixed');
        settingsForm.removeClass('hidden');
        break;

      case 'new-message':
        clearFields();
        body.addClass('fixed');
        settingsForm.addClass('hidden');
        messages.addClass('hidden');
        messageDetail.addClass('hidden');
        user.getContacts(nunjucks, 'contacts');
        messageBody.removeClass('hidden');
        break;

      case 'messages':
        clearFields();
        body.find('#loading-overlay').fadeIn();
        settingsForm.addClass('hidden');
        messageDetail.addClass('hidden');
        message.getAll(function () {
          messages.removeClass('hidden');
        });
        break;

      case 'edit-contacts':
        clearFields();
        body.addClass('fixed');
        settingsForm.addClass('hidden');
        messages.addClass('hidden');
        messageDetail.addClass('hidden');
        user.getContacts(nunjucks, 'edit_contacts');
        break;

      case 'edit-profile':
        clearFields();
        body.addClass('fixed');
        settingsForm.addClass('hidden');
        messages.addClass('hidden');
        messageDetail.addClass('hidden');
        user.getProfile(nunjucks, 'edit_profile');
        break;
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
          messageForm
            .find('#image-width')
            .val(img.width());
          messageForm
            .find('#image-height')
            .val(img.height());
          img.removeClass('hidden');
        };

        img[0].src = evt.target.result;
      };

      fileReader.readAsDataURL(file);
    }
  });

  body.on('submit', 'form', function (ev) {
    var self = $(ev.target);

    switch (self[0].id) {
      case 'message-form':
        ev.preventDefault();
        body.find('#uploading-overlay').fadeIn();
        message.create();
        body.find('#messages-inbox').click();
        break;

      case 'contacts-form':
        ev.preventDefault();
        user.addContact(self.serialize(), nunjucks);
        break;

      case 'profile-form':
        ev.preventDefault();
        user.updateProfile(self.serialize(), nunjucks);
        break;
    }
  });
});
