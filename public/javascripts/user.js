'use strict';

define(['jquery'],
  function($) {

  var body = $('body');

  var User = function() {
    this.form = null;
  };

  User.prototype.login = function () {
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
          $.get('/landing', function(data) {
            body.find('#inner-wrapper').html(data);
          });
        } else {
          console.log('Login failed because ' + data.reason);
        }
      });
    });
  };

  User.prototype.logout = function () {
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
  };

  User.prototype.addContact = function (data) {
    var self = this;

    this.form = $('#contacts-form');

    $.ajax({
      url: '/contact',
      data: data,
      type: 'POST',
      dataType: 'json',
      cache : false
    }).done(function(data) {
      self.form.find('#contact-status')
        .text('Added!')
        .addClass('on');
      self.form.find('input[name="email"]').val('');
    }).error(function(data) {
      self.form.find('#contact-status')
        .text(JSON.parse(data.responseText).message)
        .addClass('on');
    });
  };

  User.prototype.deleteContact = function (data) {
    $.ajax({
      url: '/contact',
      data: data,
      type: 'DELETE',
      dataType: 'json',
      cache : false
    });
  };

  User.prototype.getContacts = function () {
    var self = this;

    this.form = $('#message-form');

    $.ajax({
      url: '/contacts',
      type: 'GET',
      dataType: 'html',
      cache : false
    }).done(function(data) {
      self.form.find('#contact-status')
        .empty()
        .removeClass('on');
      self.form.find('#contacts').html(data);
    });
  };

  User.prototype.addApiKey = function (data) {
    var self = this;

    this.form = $('#api-form');
    var apiKey = this.form.find('input[name="apiKey"]').val();

    $.ajax({
      url: '/pushKey',
      data: data,
      type: 'POST',
      dataType: 'json',
      cache : false
    }).done(function(data) {
      var message = 'Added!';

      if (apiKey.length < 1) {
        message = 'Removed!';
      }
      self.form.find('#api-status')
        .text(message)
        .addClass('on');
    }).error(function(data) {
      self.form.find('#api-status')
        .text(JSON.parse(data.responseText).message)
        .addClass('on');
    });
  };

  return User;
});
