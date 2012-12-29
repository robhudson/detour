'use strict';

var KEYID = 'detour-message';

// subscribe a new user or return an existing one
exports.subscribe = function(req, client, callback) {
  var email = req.body.email.trim();

  client.sismember(KEYID + ':user:emails', email, function (err, resp) {
    if (err) {
      callback(err);

    } else {
      if (resp) {
        client.get(KEYID + ':user:apiKey:' + email, function (err, apiKey) {
          if (err) {
            callback(err);
          } else {
            callback(null, apiKey);
          }
        });

      } else {
        var uuid = require('node-uuid');
        var apiKey = uuid.v1();

        client.hmset(KEYID + ':user:' + apiKey, {
          name: req.body.name,
          email: email,
          apiKey: apiKey
        }, function (err, resp) {
          if (err) {
            callback(err);
          } else {
            client.sadd(KEYID + ':user:emails', email);
            client.set(KEYID + ':user:apiKey:' + email, apiKey);
            callback(null, apiKey);
          }
        });
      }
    }
  });
};

// add a new contact by email
exports.add = function (req, client, callback) {
  var email = req.body.email.trim();

  if (email.length < 5) {
    callback(new Error('Invalid email'));
  } else {
    client.sadd(KEYID + ':contacts:' + req.body.apiKey, email.toLowerCase(), function (err, resp) {
      if (err) {
        callback(err);
      } else {
        callback(null, resp);
      }
    });
  }
};

// get your user info
exports.me = function(req, client, callback) {
  client.hgetall(KEYID + ':user:' + req.query.apiKey, function (err, user) {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
};

// delete a contact
exports.delete = function (req, client, callback) {
  client.srem(KEYID + ':contacts:' + req.body.apiKey, req.body.email.toLowerCase(), function (err, resp) {
    if (err) {
      callback(err);
    } else {
      callback(null, resp);
    }
  });
};

// get all contacts
exports.getAll = function (req, client, callback) {
  client.smembers(KEYID + ':contacts:' + req.query.apiKey, function (err, contacts) {
    if (err) {
      callback(err);
    } else {
      callback(null, contacts);
    }
  });
};
