'use strict';

define(['jquery'],
  function($) {

  var Message = function() {};
  var form = $('form');
  var messageDetail = $('#message-detail');

  var MAX_TTL = 10000;

  var countdownInterval;
  var countdownDisplay;

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
      form.find('#message-status').text('Sent!');
      setTimeout(function() {
        form.find('#message-status').empty();
      }, 2500);
    }).error(function(data) {
      form.find('#message-status').text(data.responseText);
    });
  };

  Message.prototype.view = function(preview) {
    $.ajax({
      url: '/message/' + preview.data('key'),
      type: 'GET',
      dataType: 'json',
      cache: false
    }).done(function(data) {
      var seconds = (MAX_TTL / 1000) - 1;

      messageDetail.find('p').text(data.message);
      messageDetail.fadeIn();
      countdownInterval = setInterval(function() {
        messageDetail.find('.countdown').text(seconds--);
      }, 1000);
      countdownDisplay = setTimeout(function() {
        messageDetail.find('p').empty();
        messageDetail.fadeOut();
        preview.parent().remove();
        //messageDetail.find('.countdown').text('10');
        clearInterval(countdownInterval);
        clearInterval(countdownDisplay);
      }, MAX_TTL);
    }).error(function(data) {
      form.find('#message-status').text(data.responseText);
    });
  };

  return Message;
});
