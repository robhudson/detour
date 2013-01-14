'use strict';

var gravatar = require('gravatar');

var message = require('../lib/message');
var contact = require('../lib/contact');
var setting = require('../lib/setting');

module.exports = function(app, client, nconf, isLoggedIn) {
  app.get('/', function (req, res) {
    res.render('index', {
      authenticated: !!req.session.email
    });
  });

  app.post('/facebook/login', function(req, res) {
    req.session.email = req.body.email;
    res.json({ message: 'okay' });
  });

  app.get('/landing', function (req, res) {
    if (req.session.email) {
      setting.getPushKey(req, client, function (key) {
        if (key) {
          req.session.apiKey = key;
        } else {
          req.session.apiKey = null;
        }

        message.getRecent(req, client, function(err, messages) {
          res.render('_dashboard', {
            layout: false,
            authenticated: true,
            messages: messages
          });
        });
      });
    } else {
      res.render('_landing', {
        layout: false,
        authenticated: false
      });
    }
  });

  app.post('/message', isLoggedIn, function (req, res) {
    message.create(req, client, nconf, function (err, resp) {
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

  app.post('/pushKey', isLoggedIn, function (req, res) {
    setting.add(req, client, function (err, resp) {
      if (err) {
        res.status(500);
        res.json({ message: 'could not add key' });
      } else {
        req.session.apiKey = req.body.apiKey.trim();
        res.json({ message: req.body.apiKey });
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
        res.render('_contacts', {
          layout: false,
          contacts: contactsList
        });
      }
    });
  });

  app.post('/logout', isLoggedIn, function (req, res) {
    req.session.email = null;
    req.session.apiKey = null;
    res.json({
      message: 'logged out'
    })
  });
};
