# Detour

An experiment with ephemeral messaging using email addresses.

## How it works

* Sender creates a message and provides the receiver email address
* Message sits in Redis waiting to be read
* When the receiver signs in using Persona and their email matches the receiver address they get a list of unread messages
* Once the receiver views the message, it is deleted from Redis in 10 seconds

## Possible features

* Allow unread messages to die after a certain period of time
* Encryption considerations (probably not necessary as someone who wants to encrypt can just paste the encrypted block into the message area. If they are that paranoid and want to still use the system. I mean, just use something else for now then, sheesh.)

## Installing and running

> git clone git://github.com/noodle/detour.git

> npm install

> cp local.json-dist local.json

> node app.js

## Running Tests

> NODE_ENV=test make test
