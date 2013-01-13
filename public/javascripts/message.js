'use strict';

define(['jquery', 'dither'],
  function($, Dither) {

  var dither = new Dither();

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

    var canvas = $('#dither-view');
    dither.ctx = canvas[0].getContext('2d');

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
        dither.currentSource = data.message.photo;

        if (data.message.dither !== 'false') {
          dither.start = window.mozAnimationStartTime || new Date().getTime();
          dither.run();
        } else {
          dither.preview();
        }
        canvas.show();
      }

      body.addClass('fixed');
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

    this.messageDetail.find('p').empty();
    this.messageDetail.removeAttr('data-email');
    this.messageDetail.find('.countdown').text('10');
    this.messageDetail.hide();
    this.currentView.remove();
    body.removeClass('fixed');
    clearInterval(countdownInterval);
    clearInterval(countdownDisplay);
  };

  return Message;
});
