import json

from nose.tools import ok_, eq_

from detour.models import Message, User
from detour.database import db

from . import DetourTestCase


class TestMeApi(DetourTestCase):

    def test_get_me(self):
        self.login(self.user.email)

        rv = self.client.get('/1.0/me')
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        for attr in ('id', 'email', 'avatar'):
            eq_(data['data'][attr], getattr(self.user, attr))


class TestContactApi(DetourTestCase):

    def test_post_contact(self):
        self.login(self.user.email)

        contact = User(email='them2@detourapp.com')
        rv = self.client.post('/1.0/contact', data={'email': contact.email})
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        for attr in ('email', 'avatar'):
            eq_(data['data'][attr], getattr(contact, attr))
        ok_(data['data']['id'] > 0)

        # Requery user to make sure contact was added to db.
        user = User.query.filter(User.email==self.user.email).one()
        eq_(len(user.contacts), 2)
        eq_(user.contacts[1].email, contact.email)

    def test_delete_contact(self):
        self.login(self.user.email)

        rv = self.client.delete('/1.0/contact/%s' % self.contact.id)
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        for attr in ('id', 'email', 'avatar'):
            eq_(data['data'][attr], getattr(self.contact, attr))

        # Requery user to make sure contact was deleted from db.
        user = User.query.filter(User.email==self.user.email).one()
        eq_(len(user.contacts), 0)

    def test_get_contacts(self):
        self.login(self.user.email)

        rv = self.client.get('/1.0/contacts')
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        eq_(len(data['data']), 1)
        for attr in ('id', 'email', 'avatar'):
            eq_(data['data'][0][attr], getattr(self.contact, attr))


class TestMessageApi(DetourTestCase):

    def test_get_unread_messages(self):
        self.login(self.user.email)

        # Add a message.
        message = Message(from_user=self.contact, to_user=self.user,
                          message='test message', ttl=10)
        db.session.add(message)
        db.session.commit()

        # Get message from API.
        rv = self.client.get('/1.0/messages/unread')
        eq_(rv.status_code, 200)

        data = json.loads(rv.data)
        print data
        eq_(len(data['data']), 1)
        eq_(data['data'][0]['id'], message.id)
        for attr in ('email', 'avatar'):
            eq_(data['data'][0][attr], getattr(self.contact, attr))
