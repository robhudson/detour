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

client.select(app.set('redis-detour'), function (errDb, res) {
  console.log('TEST database connection status: ', res);
});

describe('message', function () {
  afterEach(function() {
    client.flushdb();
    console.log('cleared test database');
  });

  it('creates a message for another user', function (done) {
    var req = {
      body: {
        message: 'some message',
        apiKey: '123abc',
        email: 'bob@test.com'
      }
    };

    message.create(req, client, function (err, resp) {
      should.not.exist(err);
      resp.should.equal('OK');
      done();
    });
  });

  it('creates a message that does not validate', function (done) {
    var req = {
      body: {
        message: 'some message',
        apiKey: '123abc',
        email: ''
      },
      params: {
        key: 'detour-message:123abc:alice@test.org:1'
      }
    };

    message.create(req, client, function (err, resp) {
      should.exist(err);
      done();
    });
  });

  it('gets a message list for a user', function (done) {
    var req = {
      body: {
        message: 'some message',
        email: 'alice@test.org',
        apiKey: '123abc'
      },
      query: {
        email: 'alice@test.org'
      }
    };

    message.create(req, client, function (err, resp) {
      message.getRecent(req, client, function (err, messages) {
        messages.length.should.equal(1);
        done();
      });
    });
  });

  it('views a message list for a user and is deleted after viewing', function (done) {
    this.timeout(3000);

    var req = {
      body: {
        message: 'some message',
        apiKey: '123abc',
        email: 'alice@test.org'
      },
      query: {
        apiKey: '123abc',
        email: 'alice@test.org'
      },
      params: {
        key: 'detour-message:123abc:alice@test.org:1'
      }
    };

    message.create(req, client, function (err, resp) {
      message.view(req, client, function (err, msg) {
        msg.should.equal(req.body.message);
        setTimeout(function() {
          client.get(req.params.key, function (err, msg) {
            should.not.exist(msg);
          });
          done();
        }, 2500);
      });
    });
  });
});
