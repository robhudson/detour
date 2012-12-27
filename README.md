# Detour

An experiment with ephemeral messaging using email addresses.

## How it works

* Sender creates a message and provides the receiver email address
* Message sits in Redis waiting to be read
* When the receiver signs in using Persona and their email matches the receiver address they get a list of unread messages
* Once the receiver views the message, it is deleted from Redis in 10 seconds

## Installing

> git clone git://github.com/ednapiranha/detour.git

> npm install

## Running Tests

> NODE_ENV=test make test
