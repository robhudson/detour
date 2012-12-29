'use strict';

var express = require('express');
var configurations = module.exports;
var app = express();
var contact = require('../lib/contact');
var redis = require("redis");
var client = redis.createClient();
var should = require('should');
var nconf = require('nconf');

nconf.argv().env().file({ file: 'local-test.json' });

client.select(app.set('redis-detour'), function (errDb, res) {
  console.log('TEST database connection status: ', res);
});

describe('message', function() {
  afterEach(function() {
    client.flushdb();
    console.log('cleared test database');
  });

  it('creates a new user subscription', function (done) {
    var req = {
      body: {
        name: 'Alice',
        email: 'alice@test.org'
      },
      query: { }
    };

    contact.subscribe(req, client, function (err, apiKey) {
      should.not.exist(err);
      should.exist(apiKey);

      req.query.apiKey = apiKey;

      contact.me(req, client, function (err, user) {
        console.log('user created: ', user);
        should.exist(user.apiKey);
        user.name.should.equal(req.body.name);
        user.email.should.equal(req.body.email);
        done();
      });
    });
  });
});
