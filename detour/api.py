import base64
import datetime
import os
import StringIO
import tempfile
import time
from functools import wraps

from flask import Blueprint, g, jsonify, request
from PIL import Image
from sqlalchemy.orm.exc import NoResultFound

import settings
from database import db
from models import Message, User


IMAGE_WIDTH = 300


api = Blueprint('api', __name__)


#@mod.route('/')
#def index():
#    pass  # link to docs?


def api_response(data, code, msg):
    content = {}
    if data is not None:
        content['data'] = data
    content['meta'] = {'code': code, 'message': msg}
    return jsonify(**content), code


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return api_response(None, 403, 'not authorized')
        return f(*args, **kwargs)
    return decorated_function


@api.route('/me')
@login_required
def get_me():
    return api_response(g.user.to_json(), 200,
                        'profile retrieved successfully')


@api.route('/contact', methods=['POST'])
@login_required
def post_contact():
    if request.form['email']:
        email = request.form['email']
        try:
            contact = User.query.filter(User.email==email).one()
        except NoResultFound:
            contact = User(email=email)
            db.session.add(contact)
        g.user.contacts.append(contact)
        db.session.commit()

        return api_response(contact.to_json(), 200,
                            'contact added successfully')


@api.route('/contact/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    try:
        contact = User.query.filter(User.id==contact_id).one()
    except NoResultFound:
        return api_response(None, 404, 'contact not found')
    g.user.contacts.remove(contact)
    db.session.commit()

    return api_response(contact.to_json(), 200,
                        'contact removed successfully')


@api.route('/contacts')
def get_contacts():
    return api_response([c.to_json() for c in g.user.contacts], 200,
                        'contacts retrieved successfully')


@api.route('/messages/unread')
def get_unread_messages():
    messages = Message.query.filter(Message.to_user==g.user)
    return api_response([dict(id=m.id, email=m.from_user.email,
                              avatar=m.from_user.avatar,
                              created=int(time.mktime(m.created.timetuple())))
                         for m in messages], 200,
                        'messages retrieved successfully')


@api.route('/message/<int:message_id>')
def get_message(message_id):
    try:
        message = Message.query.filter(Message.id==message_id).one()
    except NoResultFound:
        return api_response(None, 404, 'message not found')

    # Update message with expired to schedule it for removal.
    message.expire = message.created + datetime.timedelta(seconds=message.ttl)
    db.session.commit()

    return api_response(message.to_json(), 200,
                        'message retrieved successfully')


@api.route('/message', methods=['POST'])
def post_message():
    if not request.form.get('email') or not (
        request.form.get('message') or request.files.get('photo')):
        return api_response(None, 400, 'bad request')

    email = request.form.get('email')
    message = request.form.get('message')
    photo = request.files.get('photo')

    # Look for user. If not found, ignore message.
    try:
        to_user = User.query.filter(User.email==email).one()
    except NoResultFound:
        return api_response(None, 404, 'recipient not found')

    # Handle photo.
    b64photo = ''
    if (photo and '.' in photo.filename):
        ext = photo.filename.rsplit('.', 1)[1]
        if ext.lower() in ('gif', 'jpg', 'jpeg', 'png'):
            path = tempfile.mkstemp()[1]
            photo.save(path)
            img = Image.open(path)
            # Find ratio to scale to IMAGE_WIDTH and keep aspect ratio.
            x, y = img.size
            ratio = float(IMAGE_WIDTH) / x
            img = img.resize((int(x * ratio), int(y * ratio)), Image.ANTIALIAS)
            buf = StringIO.StringIO()
            img.save(buf, 'JPEG')
            buf.seek(0)
            b64photo = 'data:image/jpg;base64,%s' % (
                base64.b64encode(buf.read()))
            os.unlink(path)

    message = Message(to_user=to_user, from_user=g.user,
                      message=message, photo=b64photo,
                      ttl=request.form.get('ttl', settings.DEFAULT_TTL))
    db.session.add(message)
    db.session.commit()

    return api_response(None, 200, 'message created successfully')
