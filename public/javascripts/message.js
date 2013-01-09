'use strict';

define(['jquery'],
  function($) {

  var Message = function() {};
  var body = $('body');

  var MAX_TTL = 10000;

  var countdownInterval;
  var countdownDisplay;

  var Message = function() {
    this.currentContact = null;
    this.currentView = null;
  };

  Message.prototype.send = function(data) {
    var self = this;
    this.form = $('#message-form');

    $.ajax({
      url: '/message',
      data: data,
      type: 'POST',
      dataType: 'json',
      cache: false
    }).done(function (data) {
      self.form
        .find('#current-contact, #contacts').empty();
      self.form.find('textarea, input[name="email"]').val('');
      self.form.find('img')
        .attr('src', '')
        .hide();
      self.form.find('#message-status')
        .text('Sent!')
        .addClass('on');
      setTimeout(function() {
        self.form.find('#message-status')
          .empty()
          .removeClass('on');
        self.form.fadeOut();
        body.removeClass('fixed');
      }, 1000);
    }).error(function (data) {
      self.form.find('#message-status')
        .text(JSON.parse(data.responseText).message)
        .addClass('on');
    });
  };

  Message.prototype.view = function(preview) {
    var self = this;

    if (preview.parent().hasClass('message-root')) {
      this.currentView = preview.parent();
    } else {
      this.currentView = preview.parent().parent();
    }

    this.messageDetail = $('#message-detail');

    $.ajax({
      url: '/message/' + self.currentView[0].id,
      type: 'GET',
      dataType: 'json',
      cache: false
    }).done(function(data) {
      var seconds = (MAX_TTL / 1000) - 1;
      self.currentContact = self.currentView[0].id.split(':')[1];
      if (data.message.photo) {
        self.messageDetail.find('p')
          .css({ backgroundImage: 'url("' + data.message.photo + '")' });
      }
      self.messageDetail.find('p span').text(data.message.text);
      self.messageDetail.fadeIn();

      countdownInterval = setInterval(function() {
        self.messageDetail.find('.countdown').text(seconds--);
      }, 1000);

      countdownDisplay = setTimeout(function() {
        self.clear();
      }, MAX_TTL);
    }).error(function(data) {
      form.find('#message-status')
        .text(JSON.parse(data.responseText).message)
        .addClass('on');
    });
  };

  Message.prototype.clear = function() {
    var self = this;
    this.currentContact = null;
    this.messageDetail = $('#message-detail');

    this.messageDetail.fadeOut(function() {
      self.messageDetail.find('p').empty();
      self.messageDetail.removeAttr('data-email');
      self.messageDetail.find('.countdown').text('10');
    });
    this.currentView.remove();
    clearInterval(countdownInterval);
    clearInterval(countdownDisplay);
  };

  return Message;
});
