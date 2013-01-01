var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var settings = require('./settings')(app, configurations, express);
var redis = require('redis');
var client = redis.createClient();
var nconf = require('nconf');

nconf.argv().env().file({ file: 'local.json' });

client.select(app.set('redis-detour'), function(errDb, res) {
  console.log(process.env.NODE_ENV || 'dev' + ' database connection status: ', res);
});

var isLoggedIn = function(req, res, next) {
  if (req.query.apiKey || req.body.apiKey) {
    next();
  } else {
    res.status(500);
    res.json({ message: 'you must be authenticated to access this call' });
  }
};

// routes
require("./routes")(app, client, nconf, isLoggedIn);

app.listen(process.env.PORT || nconf.get('port'));
