import json

from nose.tools import ok_, eq_

from detour.models import User
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

        contact = User(email='them@detourapp.com')
        rv = self.client.post('/1.0/contact', data={'email': contact.email})
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        for attr in ('email', 'avatar'):
            eq_(data['data'][attr], getattr(contact, attr))
        ok_(data['data']['id'] > 0)

        # Requery user to make sure contact was added to db.
        user = User.query.filter(User.email==self.user.email).one()
        eq_(len(user.contacts), 1)
        eq_(user.contacts[0].email, contact.email)

    def test_delete_contact(self):
        self.login(self.user.email)

        user = User.query.filter(User.email==self.user.email).one()
        contact = User(email='them@detourapp.com')
        db.session.add(contact)
        user.contacts.append(contact)
        db.session.commit()

        rv = self.client.delete('/1.0/contact/%s' % contact.id)
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        for attr in ('id', 'email', 'avatar'):
            eq_(data['data'][attr], getattr(contact, attr))

        # Requery user to make sure contact was deleted from db.
        user = User.query.filter(User.email==self.user.email).one()
        eq_(len(user.contacts), 0)
