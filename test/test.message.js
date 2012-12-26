'use strict';

var express = require('express');
var configurations = module.exports;
var app = express();
var message = require('../lib/message');
var redis = require("redis");
var client = redis.createClient();
var should = require('should');
var nconf = require('nconf');

nconf.argv().env().file({ file: 'local-test.json' });

client.select(app.set('redisnoodle'), function(errDb, res) {
  console.log('TEST database connection status: ', res);
});

var req = {
  body: {
    message: 'some message',
    email: 'bob@test.com'
  },
  session: {
    email: 'alice@test.org'
  }
};

describe('message', function() {
  after(function() {
    client.flushdb();
    console.log('cleared test database');
  });

  it('creates a message', function(done) {
    message.create(req, client, function(err, resp) {
      should.not.exist(err);
      resp.should.equal('OK');
      done();
    });
  });

  it('gets a message list for a user', function(done) {
    req.body.email = 'alice@test.org';

    message.create(req, client, function(err, resp) {
      message.getRecent(req, client, function(err, messages) {
        messages.length.should.equal(1);
        done();
      });
    });
  });

  it('views a message list for a user and is deleted after 10 seconds', function(done) {
    this.timeout(2800);
    req.body.email = 'alice@test.org';
    req.params = {
      key: 'detour-message:alice@test.org:alice@test.org'
    };

    message.create(req, client, function(err, resp) {
      message.view(req, client, function(err, message) {
        message.should.equal(req.body.message);
        setTimeout(function() {
          client.get(req.params.key, function(err, msg) {
            should.not.exist(msg);
          });
          done();
        }, 2500);
      });
    });
  });
});
