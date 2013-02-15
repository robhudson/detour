# -*- coding: utf-8 -*-
import browserid
from flask import Flask, jsonify, render_template, request, session
from sqlalchemy.orm.exc import NoResultFound

import settings
from database import db
from models import Message, User


app = Flask(__name__)
app.debug = getattr(settings, 'DEBUG', False)
app.secret_key = settings.SESSION_SECRET
# Database config is in database.py


@app.route('/', methods=['GET'])
def main():
    """Default landing page."""
    authenticated = False
    if session.get('email'):
        authenticated = True

    return render_template('index.html',
                           authenticated=authenticated)


@app.route('/landing', methods=['GET'])
def landing():
    if session.get('user_id'):
        messages = Message.query.filter(
            Message.to_user_id==session.get('user_id')).all()
        return render_template('_dashboard.html', messages=messages)
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
    try:
        user = User.query.filter(User.email==email).one()
    except NoResultFound:
        user = User(email=email)
        db.add(user)
        db.commit()

    session['email'] = user.email
    session['user_id'] = user.id
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
