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

client.select(app.set('redis-detour'), function(errDb, res) {
  console.log('TEST database connection status: ', res);
});

describe('message', function() {
  afterEach(function() {
    client.flushdb();
    console.log('cleared test database');
  });

  it('creates a message for another user', function(done) {
    var req = {
      body: {
        message: 'some message',
        photo_message: '',
        email: 'bob@test.com'
      },
      session: {
        email: 'alice@test.org'
      }
    };
    message.create(req, client, nconf, function(err, resp) {
      should.not.exist(err);
      resp.should.equal('OK');
      done();
    });
  });

  it('creates a message that does not validate', function(done) {
    var req = {
      body: {
        message: 'some message',
        email: ''
      },
      session: {
        email: 'alice@test.org'
      },
      params: {
        key: 'detour-message:alice@test.org:alice@test.org:1'
      }
    };

    message.create(req, client, nconf, function(err, resp) {
      should.exist(err);
      done();
    });
  });

  it('gets a message list for a user', function(done) {
    var req = {
      body: {
        message: 'some message',
        photo_message: '',
        email: 'alice@test.org'
      },
      session: {
        email: 'alice@test.org'
      }
    };

    message.create(req, client, nconf, function(err, resp) {
      message.getRecent(req, client, function(err, messages) {
        messages.length.should.equal(1);
        done();
      });
    });
  });

  it('views a message list for a user and is deleted after viewing', function(done) {
    this.timeout(3000);

    var req = {
      body: {
        message: 'some message',
        photo_message: '',
        email: 'alice@test.org'
      },
      session: {
        email: 'alice@test.org'
      },
      params: {
        key: 'detour-message:alice@test.org:alice@test.org:1'
      }
    };

    message.create(req, client, nconf, function(err, resp) {
      message.view(req, client, function(err, message) {
        message.text.should.equal(req.body.message);
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
