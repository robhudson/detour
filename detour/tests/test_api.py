import datetime
import json

from nose.tools import ok_, eq_

from detour.models import Message, User
from detour.database import db

from . import DetourTestCase


API_VERSION = '1.0'


class TestMeApi(DetourTestCase):

    def test_get_me(self):
        self.login(self.user.email)

        rv = self.client.get('/%s/me' % API_VERSION)
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        for attr in ('id', 'email', 'avatar'):
            eq_(data['data'][attr], getattr(self.user, attr))


class TestContactApi(DetourTestCase):

    def test_post_valid_contact(self):
        self.login(self.user.email)

        contact = User(email='other@detourapp.com')
        rv = self.client.post('/%s/contact' % API_VERSION,
                              data={'email': contact.email})
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        for attr in ('email', 'avatar'):
            eq_(data['data'][attr], getattr(contact, attr))
        ok_(data['data']['id'] > 0)

        # Requery user to make sure contact was added to db.
        user = User.query.filter(User.email==self.user.email).one()
        eq_(len(user.contacts), 2)
        eq_(user.contacts[0].email, contact.email)

    def test_post_invalid_null_contact(self):
        self.login(self.user.email)

        contact = User(email='')
        rv = self.client.post('/%s/contact' % API_VERSION,
                              data={'email': contact.email})
        eq_(rv.status_code, 400)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 400)

    def test_post_invalid_whitespace_contact(self):
        self.login(self.user.email)

        contact = User(email='    ')
        rv = self.client.post('/%s/contact' % API_VERSION,
                              data={'email': contact.email})
        eq_(rv.status_code, 400)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 400)

    def test_delete_contact(self):
        self.login(self.user.email)

        rv = self.client.delete('/%s/contact/%s' % (API_VERSION, self.contact.id))
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

        # Create 'other' user to test sorting.
        other = User(email='other@detourapp.com')
        db.session.add(other)
        user = User.query.filter(User.id==self.user.id).one()
        user.contacts.append(other)
        db.session.commit()

        rv = self.client.get('/%s/contacts' % API_VERSION)
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        eq_(len(data['data']), 2)
        # 'other' comes first.
        for attr in ('id', 'email', 'avatar'):
            eq_(data['data'][0][attr], getattr(other, attr))
        # 'them' comes 2nd.
        for attr in ('id', 'email', 'avatar'):
            eq_(data['data'][1][attr], getattr(self.contact, attr))


class TestMessageApi(DetourTestCase):

    def test_get_unread_messages(self):
        self.login(self.user.email)

        hour_ago = datetime.datetime.now() - datetime.timedelta(hours=1)

        # Add older message.
        message1 = Message(from_user=self.contact, to_user=self.user,
                           message='test message', ttl=10, created=hour_ago)
        message2 = Message(from_user=self.contact, to_user=self.user,
                           message='test message 2', ttl=10)
        db.session.add(message2)
        db.session.add(message1)
        db.session.commit()

        # Get message list from API.
        rv = self.client.get('/%s/messages/unread' % API_VERSION)
        eq_(rv.status_code, 200)

        data = json.loads(rv.data)
        eq_(len(data['data']), 2)
        # First created stamp is less than second.
        ok_(data['data'][0]['created'] < data['data'][1]['created'],
            'Messages not sorted by created descending.')
        for attr in ('email', 'avatar'):
            eq_(data['data'][0][attr], getattr(self.contact, attr))

    def test_get_message(self):
        self.login(self.user.email)

        # Add a message.
        message = Message(from_user=self.contact, to_user=self.user,
                          message='test message', ttl=10)
        db.session.add(message)
        db.session.commit()

        # Get message from API.
        rv = self.client.get('/%s/message/%s' % (API_VERSION, message.id))
        eq_(rv.status_code, 200)

        data = json.loads(rv.data)
        message_data = message.to_json()
        for k in data['data'].keys():
            eq_(data['data'][k], message_data[k])

        # Verify that the message was set to expire.
        message = Message.query.filter(Message.id==message.id).one()
        ok_(message.expire is not None)

    def test_get_message_404(self):
        self.login(self.user.email)

        # Create 'other' user.
        other = User(email='other@detourapp.com')
        db.session.add(other)

        # Add a message from other to them.
        message = Message(from_user=other, to_user=self.contact,
                          message='test message', ttl=10)
        db.session.add(message)
        db.session.commit()

        # Try to get message from API as user 'you'.
        rv = self.client.get('/%s/message/%s' % (API_VERSION, message.id))
        eq_(rv.status_code, 404)

    def test_post_message(self):
        self.login(self.user.email)

        rv = self.client.post('/%s/message' % API_VERSION, data={
            'email': self.contact.email,
            'message': 'test message',
            'ttl': '20',
        })
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)

        # Check message from db.
        message = Message.query.first()
        eq_(message.from_user.email, self.user.email)
        eq_(message.to_user.email, self.contact.email)
        eq_(message.message, 'test message')
        eq_(message.ttl, 20)

    def test_post_message_unknown_recipient(self):
        self.login(self.user.email)

        rv = self.client.post('/%s/message' % API_VERSION, data={
            'email': 'other@detourapp.com',
            'message': 'test message',
        })
        eq_(rv.status_code, 400)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 400)
