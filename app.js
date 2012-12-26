var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var settings = require('./settings')(app, configurations, express);
var redis = require('redis');
var client = redis.createClient();
var nconf = require('nconf');

nconf.argv().env().file({ file: 'local.json' });

client.select(app.set('redisdetour'), function(errDb, res) {
  console.log(process.env.NODE_ENV || 'dev' + ' database connection status: ', res);
});

var isLoggedIn = function(req, res, next) {
  if (req.session.email) {
    next();
  } else {
    res.redirect('/');
  }
};

require('express-persona')(app, {
  audience: nconf.get('domain') + ':' + nconf.get('authPort')
});

// routes
require("./routes")(app, client, isLoggedIn);

app.listen(process.env.PORT || nconf.get('port'));
