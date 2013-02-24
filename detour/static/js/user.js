define(['jquery', 'settings'],
  function($, settings) {

  'use strict';

  var body = settings.body;

  var API_VERSION = settings.API_VERSION;

  var User = function() {
    this.form = null;
  };

  User.prototype.addContact = function (data, nunjucks) {
    var self = this;

    this.status = $('#status');
    this.form = $('#contacts-form');

    $.ajax({
      url: '/' + API_VERSION + '/contact',
      data: data,
      type: 'POST',
      dataType: 'json',
      cache : false

    }).done(function (data) {
      self.status
        .removeClass('error')
        .text('Added!')
        .addClass('on');

      settings.statusTimer(self.status);

      self.form.find('input[name="email"]').val('');
      self.getContacts(nunjucks, 'edit_contacts');

    }).error(function (data) {
      self.status
        .addClass('error')
        .text(JSON.parse(data.responseText).meta.message)
        .addClass('on');

      settings.statusTimer(self.status);
    });
  };

  User.prototype.deleteContact = function (id) {
    $.ajax({
      url: '/' + API_VERSION + '/contact/' + id,
      type: 'DELETE',
      dataType: 'json',
      cache : false
    });
  };

  User.prototype.getContacts = function (nunjucks, template) {
    var self = this;

    this.status = $('#status');
    this.form = $('#message-form');

    var contactWrapper = body.find('#message-body');

    $.ajax({
      url: '/' + API_VERSION + '/contacts',
      type: 'GET',
      dataType: 'json',
      cache: false
    }).done(function (resp) {
      contactWrapper.html(
        nunjucks.env.getTemplate(template + '.html').render({
          contacts: resp.data
        })
      );

      contactWrapper.removeClass('hidden');
    }).error(function (resp) {
      self.status
        .addClass('error')
        .text(resp.meta.message)
        .addClass('on');

      settings.statusTimer(self.status);
    });
  };

  User.prototype.getProfile = function (nunjucks, template) {
    var self = this;

    this.status = $('#status');
    this.form = $('#message-form');

    var profileWrapper = body.find('#message-body');

    $.ajax({
      url: '/' + API_VERSION + '/me',
      type: 'GET',
      dataType: 'json',
      cache: false
    }).done(function (resp) {
      profileWrapper.html(
        nunjucks.env.getTemplate(template + '.html').render({
          data: resp.data
        })
      );

      profileWrapper.removeClass('hidden');
    }).error(function (resp) {
      self.status
        .addClass('error')
        .text(resp.meta.message)
        .addClass('on');

      settings.statusTimer(self.status);
    });
  };

  User.prototype.updateProfile = function (data) {
    var self = this;

    this.status = $('#status');
    this.form = $('#message-form');

    var profileWrapper = body.find('#message-body');

    if (data) {
      data = 'email_notification=true';
    }

    $.ajax({
      url: '/' + API_VERSION + '/me',
      type: 'PUT',
      data: data,
      dataType: 'json',
      cache: false,
      processData: false
    }).done(function (resp) {
      self.status
        .removeClass('error')
        .text('Updated!')
        .addClass('on');

      settings.statusTimer(self.status);

    }).error(function (resp) {
      self.status
        .addClass('error')
        .text(resp.meta.message)
        .addClass('on');

      settings.statusTimer(self.status);
    });
  };

  return User;
});
