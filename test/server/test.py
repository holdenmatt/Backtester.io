#!/usr/bin/env python

import os
import sys
import unittest

# Import from the /server path.
filedir = os.path.dirname(os.path.abspath(__file__))
rootdir = os.path.abspath(os.path.join(filedir, '..', '..'))
sys.path.append(rootdir + '/server')

from app import app

class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()

    def test_home_page_works(self):
        rv = self.app.get('/')
        self.assertTrue(rv.data)
        self.assertEquals(rv.status_code, 200)

    def test_about_page_works(self):
        rv = self.app.get('/about/')
        self.assertTrue(rv.data)
        self.assertEquals(rv.status_code, 200)

    def test_default_redirecting(self):
        rv = self.app.get('/about')
        self.assertEquals(rv.status_code, 301)

    def test_404_page(self):
        rv = self.app.get('/i-am-not-found/')
        self.assertEquals(rv.status_code, 404)


if __name__ == '__main__':
    unittest.main()