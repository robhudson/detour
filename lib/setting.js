'use strict';

var KEYID = 'detour-message';

exports.add = function (req, client, callback) {
  var apiKey = req.body.apiKey.trim();

  if (apiKey.length < 1) {
    callback(new Error('Invalid key format'));

  } else {
    console.log(KEYID + ':pushKey:' + req.session.email, apiKey)
    client.set(KEYID + ':pushKey:' + req.session.email, apiKey, function (err, resp) {
      if (err) {
        callback(err);
      } else {
        callback(null, resp);
      }
    });
  }
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
