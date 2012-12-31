'use strict';

var KEYID = 'detour-message';

exports.add = function (req, client, callback) {
  var apiKey = req.body.apiKey.trim();

  client.set(KEYID + ':pushKey:' + req.session.email, apiKey, function (err, resp) {
    if (err) {
      callback(err);
    } else {
      callback(null, resp);
    }
  });
};

exports.getPushKey = function (req, client, callback) {
  client.get(KEYID + ':pushKey:' + req.session.email, function (err, pushKey) {
    var key = false;

    if (!err) {
      key = pushKey;
    }

    callback(key);
  });
};
