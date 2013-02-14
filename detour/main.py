# -*- coding: utf-8 -*-
import simplejson as json
import time

import browserid
from httplib2 import Http
from urllib import urlencode

from flask import (Flask, jsonify, redirect,
                   render_template, request, session, url_for)

import settings

from helper import *
from message import Message

app = Flask(__name__)
app.secret_key = settings.SESSION_SECRET

h = Http()
message = Message()


@app.route('/', methods=['GET'])
def main():
    """Default landing page."""
    authenticated = False
    if session and session['email']:
        authenticated = True

    return render_template('index.html',
                           authenticated=authenticated)


@app.route('/landing', methods=['GET'])
def landing():
    if session and session['email']:
        return render_template('_dashboard.html')
    else:
        return render_template('_landing.html')


@app.route('/authenticate', methods=['POST'])
def set_email():
    """Verify via Persona and upon success, set
    the email for the user's session.
    """
    data = browserid.verify(request.form['assertion'],
                            settings.SITE_URL)

    session['email'] = data['email']
    return jsonify({'message':'okay'})


@app.route('/logout', methods=['GET', 'POST'])
def logout():
    """Log the user out."""
    session.pop('email', None)
    return jsonify({'message':'okay'})


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html')


@app.errorhandler(500)
def something_broke(error):
    return render_template('500.html')


if __name__ == '__main__':
    app.debug = settings.DEBUG
    app.run()
