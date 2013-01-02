# Detour

An experiment with ephemeral messaging using email addresses.

## How it works

* Sender creates a message and provides the receiver email address
* Message sits in Redis waiting to be read
* When the receiver signs in and their api key matches the receiver key they get a list of unread messages
* Once the receiver views the message, it is deleted from Redis in 10 seconds

## Possible features

* Allow unread messages to die after a certain period of time
* Encryption considerations (probably not necessary as someone who wants to encrypt can just paste the encrypted block into the message area. If they are that paranoid and want to still use the system. I mean, just use something else for now then, sheesh.)

## Server version

* Relies on an apiKey to access authenticated requests
* Format of messages are `detour-message:<your API key>:<recipient email>:<id>`
* A user must sign in and have a matching email as the recipient in order to access the message

## Installing and running

> git clone git://github.com/ednapiranha/detour.git

> git checkout server

> npm install

> cp local.json-dist local.json

> node app.js

## Running Tests

> NODE_ENV=test make test
