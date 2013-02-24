import datetime
import os

from flask.ext.script import Manager

from app import create_app
from database import db
from models import Message


app = create_app({
    'SQLALCHEMY_DATABASE_URI': os.environ.get(
        'DATABASE_URL', 'sqlite:///detour_app.db'),
    'SQLALCHEMY_ECHO': True  # Show SQL on console.
})
manager = Manager(app)


@manager.command
def expire_messages():
    """
    Expire messages with `expire` less than current time.

    Intended to be run via cron every minute.
    """
    now = datetime.datetime.now()
    Message.query.filter(Message.expire < now).delete(
        synchronize_session=False)
    db.session.commit()


if __name__ == '__main__':
    manager.run()
