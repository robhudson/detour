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

## Setting up nunjucks

This will allow you to compile your templates for production

To read more about nunjucks, check out the [documentation](http://nunjucks.jlongster.com)

Install [node](http://nodejs.org)

> npm install nunjucks

## Creating the database

> python

> \>>> from detour.database import db

> \>>> from detour.app import create_app

> \>>> app = create_app({})

> \>>> db.app = app

> \>>> db.init_app(app)

> \>>> db.create_all()

## Run the app

> python detour/app.py

## Tests

In the top level of the project, run the following

> nosetests
