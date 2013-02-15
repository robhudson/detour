import datetime

from sqlalchemy import (Column, DateTime, ForeignKey, Integer, String,
                        Table, Text)
from sqlalchemy.orm import backref, relationship

from database import Base


user_to_user = Table('contacts', Base.metadata,
    Column('user_id', Integer, ForeignKey('user.id')),
    Column('contact_id', Integer, ForeignKey('user.id'))
)


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    email = Column(String(200), unique=True)
    contacts = relationship('User', secondary=user_to_user,
                            primaryjoin=id==user_to_user.c.user_id,
                            secondaryjoin=id==user_to_user.c.contact_id,
                            backref=backref('users', lazy='dynamic'))

    def __repr__(self):
        return '<User: %s>' % self.email


class Message(Base):
    __tablename__ = 'message'
    id = Column(Integer, primary_key=True)
    from_user_id = Column(Integer, ForeignKey('user.id'))
    to_user_id = Column(Integer, ForeignKey('user.id'))
    from_user = relationship('User', primaryjoin=from_user_id==User.id)
    to_user = relationship('User', primaryjoin=to_user_id==User.id)
    message = Column(String(250))
    photo = Column(Text)
    ttl = Column(Integer)
    expire = Column(DateTime)
    created = Column(DateTime, default=datetime.datetime.now)

    def __repr__(self):
        return '<Message: [%s] %s => %s>' % (self.id, self.from_user_id,
                                             self.to_user_id)
