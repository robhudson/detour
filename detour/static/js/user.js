define(['jquery'],
  function($) {

  'use strict';

  var body = $('body');

  var API_VERSION = '1.0';

  var User = function() {
    this.form = null;
  };

  User.prototype.addContact = function (data, nunjucks) {
    var self = this;

    this.form = $('#contacts-form');

    $.ajax({
      url: '/' + API_VERSION + '/contact',
      data: data,
      type: 'POST',
      dataType: 'json',
      cache : false

    }).done(function (data) {
      self.form.find('#contact-status')
        .text('Added!')
        .addClass('on');
      self.form.find('input[name="email"]').val('');
      self.getContacts(nunjucks, 'edit_contacts');

    }).error(function (data) {
      self.form.find('#contact-status')
        .text(JSON.parse(data.responseText).meta.message)
        .addClass('on');

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
      self.form.find('#contact-status')
        .text(resp.meta.message)
        .addClass('on');
    });
  };
  /*
  User.prototype.addEmailNotification = function (data) {
    var self = this;

    this.form = $('#email-notification-form');

    $.ajax({
      url: '/emailNotification',
      data: data,
      type: 'POST',
      dataType: 'json',
      cache : false
    }).done(function (data) {
      var message = 'Updated!';

      self.form.find('#email-notification-status')
        .text(message)
        .addClass('on');
    }).error(function (data) {
      self.form.find('#email-notification-status')
        .text(JSON.parse(data.responseText).message)
        .addClass('on');
    });
  };
  */
  return User;
});
