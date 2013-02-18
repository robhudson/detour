from functools import wraps

from flask import Blueprint, g, jsonify, request
from sqlalchemy.orm.exc import NoResultFound

from database import db
from models import User


api = Blueprint('api', __name__)


#@mod.route('/')
#def index():
#    pass  # link to docs?


def api_response(data, code, msg):
    return jsonify(data=data, meta={'code': code, 'message': msg})


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return api_response({}, 403, 'not authorized')
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
        return api_response({}, 404, 'contact not found')
    g.user.contacts.remove(contact)
    db.session.commit()

    return api_response(contact.to_json(), 200,
                        'contact removed successfully')


@api.route('/contacts')
def get_contacts():
    return api_response([c.to_json() for c in g.user.contacts], 200,
                        'contacts retrieved successfully')
