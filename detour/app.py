# -*- coding: utf-8 -*-
import browserid
from flask import Flask, jsonify, render_template, request, session

import settings
from database import db
from models import User


app = Flask(__name__)
app.debug = getattr(settings, 'DEBUG', False)
app.secret_key = settings.SESSION_SECRET
# Database config is in database.py


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
    """Verify via Persona.

    Upon success, create the user if it doesn't already exist and set the email
    for the user's session.
    """
    data = browserid.verify(request.form['assertion'], settings.SITE_URL)
    email = data['email']

    # Create user record.
    if not User.query.filter(User.email==email).count():
        u = User(email=email)
        db.add(u)
        db.commit()

    session['email'] = email
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
