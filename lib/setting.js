'use strict';

var KEYID = 'detour-message';

exports.addEmailNotification = function (req, client, callback) {
  if (!req.body.emailNotification) {
    // delete email key
    client.del(KEYID + ':emailNotification:' + req.session.email, function (err, resp) {
      if (err) {
        callback(err);
      } else {
        callback(null, resp);
      }
    });
  } else {
    client.set(KEYID + ':emailNotification:' + req.session.email, 1, function (err, resp) {
      if (err) {
        callback(err);
      } else {
        callback(null, resp);
      }
    });
  }
};

exports.getEmailNotification = function (req, client, callback) {
  client.get(KEYID + ':emailNotification:' + req.session.email, function (err, resp) {
    var email = false;

    if (!err) {
      email = resp;
    }

    callback(email);
  });
};
