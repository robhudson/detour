'use strict';

var gravatar = require('gravatar');
var contact = require('./contact');
var request = require('request');

var KEYID = 'detour-message';
var MAX_TTL = 10; // 10 seconds

if (process.env.NODE_ENV === 'test') {
  MAX_TTL = 1;
}

var setMessage = function (req) {
  return req.body.message.trim().slice(0, 199);
};

var addContact = function(req, client, email) {
  req.body.email = email;
  contact.add(req, client, function() { });
};

var sendNotification = function(req, keyName, nconf, client, recipient) {
  client.get(KEYID + ':pushKey:' + recipient, function (err, key) {
    if (key) {
      var params = {
        url: 'https://api.pushover.net/1/messages.json',
        qs: {
          token: nconf.get('pushover_key'),
          user: key,
          message: req.session.email + ' sent you a message',
          url: 'https://detourapp.com'
        }
      };

      request.post(params, function(err, resp, body) {
        if (err) {
          console.error('Notification failed');
        } else {
          console.info('Notification sent');
        }
      });
    }
  });
};

exports.create = function (req, client, nconf, callback) {
  var recipient = req.body.email.trim();

  if (!recipient) {
    callback(new Error('email cannot be empty'));
  } else {
    var keyName = KEYID + ':' + req.session.email.toLowerCase() + ':' + recipient.toLowerCase();
    client.incr(KEYID, function(err, incr) {
      if (err) {
        callback(err);
      } else {
        addContact(req, client, recipient);
        keyName += ':' + incr;

        var message = {
          text: setMessage(req),
          photo: req.body.photo_message,
          dither: req.body.dither || false
        };

        client.hmset(keyName, message, function(err, resp) {
          if (err) {
            callback(err);
          } else {
            sendNotification(req, keyName, nconf, client, recipient);
            callback(null, resp);
          }
        });
      }
    });
  }
};

exports.view = function (req, client, callback) {
  var keyName = req.params.key;
  client.hgetall(keyName, function(err, msg) {
    if (err) {
      callback(err);
    } else {
      addContact(req, client, keyName.split(':')[1]);
      client.ttl(keyName, function(err, ttl) {
        if (ttl === -1) {
          client.expire(keyName, MAX_TTL);
        }
      });
      callback(null, msg);
    }
  });
}

exports.getRecent = function (req, client, callback) {
  var keyName = KEYID + ':*:' + req.session.email.toLowerCase() + ':*';
  client.keys(keyName, function(err, msgs) {
    if (err) {
      callback(err);
    } else {
      var messages = [];

      if (msgs.length > 0) {
        for (var i = 0; i < msgs.length; i ++) {
          var messageArr = msgs[i].split(':');

          messages.push({
            key: msgs[i],
            avatar: gravatar.url(messageArr[1], {}, true),
            name: 'from: ' + messageArr[1]
          });

          if (messages.length === msgs.length) {
            callback(null, messages);
          }
        }
      } else {
        callback(null, messages);
      }
    }
  });
};
