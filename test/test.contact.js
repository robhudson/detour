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

  it('adds a new contact', function (done) {
    var req = {
      body: {
        email: 'alice@test.org'
      },
      session: {
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
        email: 'alice@test.org'
      },
      session: {
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
