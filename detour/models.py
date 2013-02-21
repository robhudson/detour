import datetime
import hashlib
import time

import settings
from database import db


user_to_user = db.Table('contacts', db.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('contact_id', db.Integer, db.ForeignKey('user.id'))
)


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(200), unique=True)
    contacts = db.relationship('User', secondary=user_to_user,
                               primaryjoin=id==user_to_user.c.user_id,
                               secondaryjoin=id==user_to_user.c.contact_id,
                               backref=db.backref('users', lazy='joined'),
                               order_by='User.email')

    def __repr__(self):
        return '<User: %s>' % self.email

    def __eq__(self, other):
        return self.id == other.id

    @property
    def avatar(self):
        return 'http://www.gravatar.com/avatar/%s?s=40' % (
            hashlib.md5(self.email).hexdigest())

    def to_json(self):
        return dict(id=self.id, email=self.email, avatar=self.avatar)


class Message(db.Model):
    __tablename__ = 'message'
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    to_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    from_user = db.relationship('User', primaryjoin=from_user_id==User.id)
    to_user = db.relationship('User', primaryjoin=to_user_id==User.id)
    message = db.Column(db.String(250))
    photo = db.Column(db.Text)
    ttl = db.Column(db.Integer, default=settings.DEFAULT_TTL)
    expire = db.Column(db.DateTime)
    created = db.Column(db.DateTime, default=datetime.datetime.now)

    def __repr__(self):
        return '<Message: [%s] %s => %s>' % (self.id, self.from_user_id,
                                             self.to_user_id)

    @property
    def created_stamp(self):
        return int(time.mktime(self.created.timetuple()))

    def to_json(self):
        return dict(
            id=self.id, email=self.from_user.email,
            avatar=self.from_user.avatar,
            message=self.message if self.message else '',
            photo=self.photo if self.photo else '',
            ttl=self.ttl, created=self.created_stamp)
