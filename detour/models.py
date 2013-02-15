from sqlalchemy import (Column, DateTime, ForeignKey, Integer, String, Table,
                        Text)
from sqlalchemy.orm import backref, relationship

from detour.database import Base


class Message(Base):
    __tablename__ = 'message'
    id = Column(Integer, primary_key=True)
    from_user_id = Column(Integer, ForeignKey('user.id'))
    from_user = relationship('User',
                             backref=backref('sent', lazy='dynamic'))
    to_user_id = Column(Integer, ForeignKey('user.id'))
    to_user = relationship('User',
                           backref=backref('messages', lazy='dynamic'))
    email = Column(String(250))
    photo = Column(Text)
    ttl = Column(Integer)
    expire = Column(DateTime)

    def __repr__(self):
        return '<Message: [%s] %s => %s>' % (self.id, self.from_user_id,
                                             self.to_user_id)


contacts = Table('contacts', Base.metadata,
    Column('user_id', Integer, ForeignKey('user.id')),
    Column('contact_id', Integer, ForeignKey('user.id'))
)


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    email = Column(String(200), unique=True)
    contacts = relationship('User', secondary=contacts,
                            backref=backref('contacts', lazy='dynamic'))

    def __repr__(self):
        return '<User: %s>' % self.email
