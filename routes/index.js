'use strict';

var message = require('../lib/message');

module.exports = function(app, client, isLoggedIn) {
  app.get('/', function (req, res) {
    if (req.session.email) {
      res.redirect('/dashboard');
    } else {
      res.render('index', {
        pageType: 'home'
      });
    }
  });

  app.get('/dashboard', isLoggedIn, function (req, res) {
    message.getRecent(req, client, function(err, messages) {
      if (err) {
        res.render('dashboard', {
          pageType: 'dashboard',
          messages: []
        });
      } else {
        res.render('dashboard', {
          pageType: 'dashboard',
          messages: messages
        });
      }
    });
  });

  app.post('/message', isLoggedIn, function (req, res) {
    message.create(req, client, function (err, resp) {
      if (err) {
        res.status(500);
        res.json({ message: 'something went wrong' });
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
};
