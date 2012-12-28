'use strict';

var gravatar = require('gravatar');

var message = require('../lib/message');
var contact = require('../lib/contact');

module.exports = function(app, client, isLoggedIn) {
  app.get('/', function (req, res) {
    res.render('index', {
      authenticated: !!req.session.email
    });
  });

  app.get('/landing', function (req, res) {
    if (req.session.email) {
      message.getRecent(req, client, function(err, messages) {
        res.render('_dashboard', {
          layout: false,
          authenticated: true,
          messages: messages
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
        res.render('_contacts', {
          layout: false,
          contacts: contactsList
        });
      }
    });
  });
};
