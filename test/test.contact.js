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

  it('returns an existing user subscription', function (done) {
    var req = {
      body: {
        name: 'Alice',
        email: 'alice@test.org'
      }
    };

    contact.subscribe(req, client, function (err, apiKey1) {
      contact.subscribe(req, client, function (err, apiKey2) {
        console.log('user key found: ', apiKey2);
        apiKey2.should.equal(apiKey1);
        done();
      });
    });
  });

  it('adds a new contact', function (done) {
    var req = {
      body: {
        apiKey: '123abc',
        email: 'alice@test.org'
      }
    };

    contact.add(req, client, function (err, resp) {
      should.not.exist(err);
      should.exist(resp);
      done();
    });
  });

  it('deletes a contact', function (done) {
    var req = {
      body: {
        apiKey: '123abc',
        email: 'alice@test.org'
      }
    };

    contact.add(req, client, function (err, resp) {
      contact.delete(req, client, function (err, resp) {
        should.not.exist(err);
        should.exist(resp);
        done();
      });
    });
  });
});
