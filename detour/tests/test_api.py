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
        eq_(data['data']['email'], self.user.email)
        eq_(data['data']['avatar'], self.user.avatar)


class TestContactApi(DetourTestCase):

    def test_post_contact(self):
        self.login(self.user.email)

        contact = User(email='them@detourapp.com')
        rv = self.client.post('/1.0/contact', data={'email': contact.email})
        eq_(rv.status_code, 200)
        data = json.loads(rv.data)
        eq_(data['meta']['code'], 200)
        eq_(data['data']['email'], contact.email)
        eq_(data['data']['avatar'], contact.avatar)
