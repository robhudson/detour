from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import backref, relationship

from detour.database import Base


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
