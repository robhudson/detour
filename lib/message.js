'use strict';

var gravatar = require('gravatar');
var contact = require('./contact');

var KEYID = 'detour-message';
var MAX_TTL = 10; // 10 seconds

if (process.env.NODE_ENV === 'test') {
  MAX_TTL = 1;
}

// this is a stub in case someday fancy crypto things are
// done to the message before it it saved
var setMessage = function (req) {
  return req.body.message;
};

exports.create = function (req, client, callback) {
  var recipient = req.body.email.trim();

  if (!recipient || recipient.indexOf('@') === -1) {
    callback(new Error('email must be valid'));

  } else {
    var keyName = KEYID + ':' + req.body.apiKey + ':' + recipient.toLowerCase();

    client.incr(KEYID, function(err, incr) {
      if (err) {
        callback(err);
      } else {
        req.body.email = recipient;
        contact.add(req, client, function() { });
        keyName += ':' + incr;

        client.set(keyName, setMessage(req), function(err, resp) {
          if (err) {
            callback(err);
          } else {
            callback(null, resp);
          }
        });
      }
    });
  }
};

exports.view = function (req, client, callback) {
  var keyName = req.params.key;

  client.get(keyName, function(err, msg) {
    if (err) {
      callback(err);

    } else {
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
  var keyName = KEYID + ':*:' + req.query.email + ':*';

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
