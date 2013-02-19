define(['jquery'],
  function($) {

  'use strict';

  var body = $('body');

  var API_VERSION = '1.0';

  var countdownInterval;
  var countdownDisplay;

  var Message = function() { };

  var dateDisplay = function(time) {
    var date = new Date(parseInt(time, 10));
    var now = Math.round(new Date().getTime() / 1000);
    var diff = (now - date);
    var dayDiff = Math.floor(diff / 86400);

    if (isNaN(dayDiff)) {
      return '?';
    }

    if (dayDiff <= 0) {
      if (diff < 60) {
        return 'less than 1 minute ago';
      } else if (diff < 3600) {
        return Math.floor(diff / 60) + ' minutes ago';
      } else {
        return Math.floor(diff / 3600) + ' hours ago';
      }
    } else {
      return dayDiff + ' days ago';
    }
  };

  Message.prototype.create = function () {
    var self = this;
    this.form = $('#message-form');

    var fd = new FormData(this.form[0]);
    var ts = Math.round((new Date()).getTime() / 1000);

    try {
      fd.append('photo' + ts, this.form.find('#photo-file')[0].files);
    } catch (e) {
      console.log('error ', e);
    }

    $.ajax({
      url: '/' + API_VERSION + '/message',
      data: fd,
      type: 'POST',
      processData: false,
      contentType: false,
      cache: false

    }).done(function (data) {

      self.form
        .find('#current-contact, #contacts').empty();
      self.form.find('input[type="file"], input[name="email"], textarea, input[type="text"], #image-width, #image-height').val('');
      body.find('#preview-img')
        .attr('src', '')
        .addClass('hidden');
      self.form.find('#message-status')
        .text('Sent!')
        .addClass('on');

      if (data.isSelf) {
        $.get('/message/list/' + data.id, function (data) {
          body.find('ol.messages').prepend(data);
        });
      }

      self.form.find('#message-status')
        .empty()
        .removeClass('on');
      self.form.fadeOut();
      body.removeClass('fixed');
      body.find('#uploading-overlay').fadeOut();
      self.clear();

    }).error(function (data) {
      body.find('#uploading-overlay').fadeOut();
      self.form.find('#message-status')
        .text(JSON.parse(data.responseText).message)
        .addClass('on');
    });
  };

  Message.prototype.view = function (preview) {
    var self = this;
    var img = $('#preview-img');

    body.find('#viewing-overlay').fadeIn();

    if (preview.parent().hasClass('message-root')) {
      this.currentView = preview.parent();
    } else {
      this.currentView = preview.parent().parent();
    }

    this.messageDetail = $('#message-detail');

    $.ajax({
      url: '/' + API_VERSION + '/message/' + self.currentView.data('id'),
      type: 'GET',
      dataType: 'json',
      cache: false

    }).done(function (resp) {
      var seconds = resp.data.ttl;

      self.currentContact = self.currentView.data('email');

      if (resp.data.photo) {
        img.attr('src', resp.data.photo);
        img.removeClass('hidden');
      }

      body.find('#viewing-overlay').fadeOut();
      body.addClass('fixed');
      self.messageDetail.find('p span').text(resp.data.message);
      self.messageDetail.find('p time').append('Sent ' +
          dateDisplay(resp.data.created));
      self.messageDetail.find('.countdown').text(seconds);
      self.messageDetail.fadeIn();

      countdownInterval = setInterval(function () {
        self.messageDetail.find('.countdown').text(--seconds);
      }, 1000);

      countdownDisplay = setTimeout(function () {
        self.clear();
      }, seconds * 1000);

    }).error(function (data) {
      body.find('#viewing-overlay').fadeOut();
    });
  };

  Message.prototype.clear = function() {
    var self = this;
    var img = $('#preview-img');
    this.currentContact = null;
    this.messageDetail = $('#message-detail');
    this.messageDetail.find('p span, p time, .countdown').empty();
    this.messageDetail.removeAttr('data-email');
    this.messageDetail.hide();
    img.attr('src', '');

    if (this.currentView) {
      this.currentView.remove();
    }

    body.find('canvas').addClass('hidden');
    body.removeClass('fixed');
    clearInterval(countdownInterval);
    clearInterval(countdownDisplay);
  };

  return Message;
});
