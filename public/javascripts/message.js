'use strict';

define(['jquery'],
  function($) {

  var Message = function() {};
  var form = $('form');
  var messageDetail = $('#message-detail');

  var MAX_TTL = 10000;

  var countdownInterval;
  var countdownDisplay;
  var currentView;

  Message.prototype.send = function(data) {
    $.ajax({
      url: '/message',
      data: data,
      type: 'POST',
      dataType: 'json',
      cache: false
    }).done(function(data) {
      form.find('textarea').val('');
      form.find('input[name="email"]').val('');
      form.find('#current-contact').empty();
      form.find('#message-status').text('Sent!');
      setTimeout(function() {
        form.find('#message-status').empty();
        form.fadeOut();
      }, 1000);
    }).error(function(data) {
      form.find('#message-status').text(JSON.parse(data.responseText).message);
    });
  };

  Message.prototype.view = function(preview) {
    var self = this;

    if (preview.parent().hasClass('message-root')) {
      currentView = preview.parent();
    } else {
      currentView = preview.parent().parent();
    }
    $.ajax({
      url: '/message/' + currentView[0].id,
      type: 'GET',
      dataType: 'json',
      cache: false
    }).done(function(data) {
      var seconds = (MAX_TTL / 1000) - 1;
      messageDetail.attr('data-email', currentView[0].id.split(':')[1]); // reply to email
      messageDetail.find('p').text(data.message);
      messageDetail.fadeIn();

      countdownInterval = setInterval(function() {
        messageDetail.find('.countdown').text(seconds--);
      }, 1000);

      countdownDisplay = setTimeout(function() {
        self.clear();
      }, MAX_TTL);
    }).error(function(data) {
      form.find('#message-status').text(JSON.parse(data.responseText).message);
    });
  };

  Message.prototype.clear = function() {
    messageDetail.find('p').empty();
    messageDetail.fadeOut();
    messageDetail.removeAttr('data-email');
    messageDetail.find('.countdown').text('10');
    currentView.remove();
    clearInterval(countdownInterval);
    clearInterval(countdownDisplay);
  };

  return Message;
});
