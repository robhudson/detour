'use strict';

var fs = require('fs');
var gravatar = require('gravatar');
var contact = require('./contact');
var request = require('request');
var im = require('imagemagick');

var KEYID = 'detour-message';
// 2 second so that they can't refresh the site and
// try to make it appear longer
var MAX_TTL = 2;
var IMAGE_WIDTH = 300;

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

var sendNotificationEmail = function(req, nconf) {
  var fs = require('fs');
  var path = require('path');
  var postmark = require('postmark')(nconf.get('postmark_api_key'));

  console.log('sending to ', req.body.email)
  postmark.send({
    'From': 'detour@noodleindustries.com',
    'To': req.body.email,
    'Subject': req.session.email + ' sent you a message!',
    'HtmlBody': 'View the message at <a href="https://detourapp.com">' +
      'https://detourapp.com</a></p>' +
      '<p>To stop receiving notifications, visit ' +
      '<a href="https://detourapp.com">https://detourapp.com</a> to update your settings.</p>',
    'TextBody': 'View the message at https://detourapp.com\n' +
      'To stop receiving notifications, visit https://detourapp.com to update your settings'

  }, function(err, success) {
    if (err) {
      throw new Error('Unable to send via postmark: ' + err.message);
    } else {
      console.info('Sent to postmark for delivery');
    }
  });
};

var sendNotification = function(req, keyName, nconf, client, recipient) {
  client.get(KEYID + ':pushKey:' + recipient, function (err, key) {
    if (key) {
      sendNotificationPushover(req, nconf, key);
    }
  });

  client.get(KEYID + ':emailNotification:' + recipient, function (err, key) {
    if (key && req.session.email !== recipient) {
      sendNotificationEmail(req, nconf);
    }
  });
};

var generateImage = function (req, callback) {
  var photo = './' + req.files.photo.path;

  if (req.files.photo.size > 1) {
    var type = req.files.photo.type.split('/')[1];

    im.resize({
      srcPath: photo,
      dstPath: photo,
      quality: 0.7,
      format: type,
      progressive: true,
      width: IMAGE_WIDTH,

    }, function (err, stdout, stderr) {
      if (err) {
        fs.unlink(photo);
        callback(err);
      } else {
        fs.readFile(photo, function (err, data) {
          if (err) {
            fs.unlink(photo);
            callback(err);
          } else {
            callback(null, 'data:image/' + type + ';base64,' + (new Buffer(data).toString('base64')));
            fs.unlink(photo);
          }
        });
      }
    });

  } else {
    fs.unlink(photo);
    callback(null, '');
  }
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
        generateImage(req, function (err, img) {
          if (err) {
            callback(err);

          } else {
            addContact(req, client, recipient);
            keyName += ':' + incr;

            var message = {
              text: setMessage(req),
              photo: img,
              dither: req.body.dither || false,
              width: req.body.width || 0,
              height: req.body.height || 0
            };

            client.hmset(keyName, message, function(err, resp) {
              if (err) {
                callback(err);
              } else {
                sendNotification(req, keyName, nconf, client, recipient);
                callback(null, incr);
              }
            });
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

exports.getMessage = function (req, client, callback) {
  var keyName = KEYID + ':*:' + req.session.email.toLowerCase() + ':' + parseInt(req.params.id, 10);
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
