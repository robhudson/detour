# Detour

An experiment with ephemeral messaging using email addresses.

## Documentation and API Specs

Currently we are working on version 1.0. [View the documentation](https://github.com/ednapiranha/detour/tree/flask/docs)

## How it works

* Sender creates a message and provides the receiver email address
* Message sits in the server waiting to be read
* When the receiver signs in using Persona and their email matches the receiver address they get a list of unread messages
* Once the receiver views the message, it is deleted from the server

## Possible features

* Allow unread messages to die after a certain period of time
* Encryption considerations (probably not necessary as someone who wants to encrypt can just paste the encrypted block into the message area. If they are that paranoid and want to still use the system. I mean, just use something else for now then, sheesh.)

## Installing

> mkvirtualenv detour

> pip install -r requirements.txt

> cp detour/settings.py-local detour/settings.py

## Install nunjucks

Install [node.js](http://nodejs.org/)

> npm install nunjucks

## Creating the database

> python

> \>>> from detour.database import *

> \>>> init_db()

## Running

> python detour/app.py

## Running Tests

In the top level of the project, run the following

> python -m detour.tests.test
