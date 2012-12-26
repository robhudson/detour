'use strict';

var gravatar = require('gravatar');

var MAX_TTL = 10; // 10 seconds

if (process.env.NODE_ENV === 'test') {
  MAX_TTL = 1;
}

var setMessage = function(req) {
  return req.body.message;
};

exports.create = function(req, client, callback) {
  var keyName = 'detour-message:' + req.session.email + ':' + req.body.email;
  client.set(keyName, setMessage(req), function(err, resp) {
    if (err) {
      callback(err);
    } else {
      callback(null, resp);
    }
  });
};

exports.view = function(req, client, callback) {
  var keyName = req.params.key;
  client.get(keyName, function(err, msg) {
    if (err) {
      callback(err);
    } else {
      client.expire(keyName, MAX_TTL);
      callback(null, msg);
    }
  });
}

exports.getRecent = function(req, client, callback) {
  var keyName = 'detour-message:*:' + req.session.email;
  client.keys(keyName, function(err, msgs) {
    if (err) {
      callback(err);
    } else {
      var messages = [];

      if (msgs.length > 0) {
        for (var i = 0; i < msgs.length; i ++) {
          messages.push(msgs[i]);

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
