'use strict';

var gravatar = require('gravatar');

var message = require('../lib/message');
var contact = require('../lib/contact');
var request = require('request');

module.exports = function(app, client, nconf, isLoggedIn) {
  app.get('/unread', isLoggedIn, function (req, res) {
    message.getRecent(req, client, function (err, messages) {
      if (err) {
        res.status(500);
        res.json({ message: 'could not retreive unread' });
      } else {
        res.json({
          messages: messages
        });
      }
    });
  });

  app.post('/message', isLoggedIn, function (req, res) {
    message.create(req, client, function (err, resp) {
      if (err) {
        res.status(500);
        res.json({ message: 'please choose a contact' });
      } else {
        res.json({ message: 'okay' });
      }
    });
  });

  app.get('/message/:key', isLoggedIn, function (req, res) {
    message.view(req, client, function (err, resp) {
      if (err) {
        res.status(500);
        res.json({ message: 'not authorized' });
      } else {
        res.json({ message: resp });
      }
    });
  });

  app.post('/contact', isLoggedIn, function (req, res) {
    contact.add(req, client, function (err, resp) {
      if (err) {
        res.status(500);
        res.json({ message: 'invalid email' });
      } else {
        res.json({ message: 'okay' });
      }
    });
  });

  app.delete('/contact', isLoggedIn, function (req, res) {
    contact.delete(req, client, function (err, resp) {
      if (err) {
        res.status(500);
        res.json({ message: 'could not delete contact' });
      } else {
        res.json({ message: 'okay' });
      }
    });
  });

  app.get('/contacts', isLoggedIn, function (req, res) {
    contact.getAll(req, client, function (err, contacts) {
      if (err) {
        res.status(500);
        res.render('_500', {
          layout: false
        });
      } else {
        var contactsList = [];

        for (var i = 0; i < contacts.length; i ++) {
          contactsList.push({
            avatar: gravatar.url(contacts[i], {}, true),
            email: contacts[i]
          })
        }

        res.json({ contacts: contactsList });
      }
    });
  });

  app.post('/verify', function (req, res) {
    var authUrl = nconf.get('authUrl') + '/verify';
    var siteUrl = nconf.get('domain') + ':' + nconf.get('authPort');

    if (!req.body.assertion) {
      req.status(500);
      res.json({ message: 'Invalid assertion' });
    }

    var qs = {
      assertion: req.body.assertion,
      audience: siteUrl
    };

    var params = {
      url: authUrl,
      form: qs
    };

    request.post(params, function(err, resp, body) {
      if (err) {
        req.status(500);
        res.json({ message: 'Could not get email' });
      }

      var jsonResp = JSON.parse(body);

      if (jsonResp.status === 'okay') {
        req.body.email = jsonResp.email;
        contact.subscribe(req, client, function (err, apiKey) {
          if (err) {
            res.status(500);
            res.json({ message: 'Could not subscribe' });
          } else {
            res.json({ key: apiKey });
          }
        });
      }
    });
  });
};
