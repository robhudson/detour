from sqlalchemy import *
from migrate import *


meta = MetaData()


contacts = Table('contacts', meta,
    Column('user_id', Integer),
    Column('contact_id', Integer),
)

message = Table('message', meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('from_user_id', Integer),
    Column('to_user_id', Integer),
    Column('message', String(250)),
    Column('photo', Text),
    Column('ttl', Integer),
    Column('expire', DateTime),
    Column('created', DateTime),
)

user = Table('user', meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('email', String(200)),
    Column('notification', Integer),
)


def upgrade(migrate_engine):
    """Add the color and repo_url fields to the project table """
    meta.bind = migrate_engine
    user.create()
    contacts.create()
    message.create()


def downgrade(migrate_engine):
    """Remove the color and repo_url fields from the project table"""
    meta.bind = migrate_engine
    user.drop()
    contacts.drop()
    message.drop()
