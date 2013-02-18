import unittest

from detour.app import create_app
from detour.database import db
from detour.models import User


class DetourTestCase(unittest.TestCase):

    def setUp(self):
        config = {
            'SQLALCHEMY_DATABASE_URI': 'sqlite://',
            'TESTING': True,
        }
        self.app = create_app(config)
        db.create_all()
        self.client = self.app.test_client()

        # Create 'you' user.
        self.user = User(email='you@detourapp.com')
        db.session.add(self.user)

        # Create 'them' user.
        self.contact = User(email='them@detourapp.com')
        db.session.add(self.contact)
        self.user.contacts.append(self.contact)

        # Commit to db.
        db.session.commit()

        # Access id attrs so it attaches to the obj.
        _ = self.user.id
        _ = self.contact.id

    def tearDown(self):
        db.drop_all()

    def login(self, email):
        with self.client.session_transaction() as sess:
            sess['email'] = email
