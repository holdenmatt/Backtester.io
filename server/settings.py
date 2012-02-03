"""
settings.py

Configure application settings.
"""

DEBUG = True

# static/template paths used by Flask:
# http://flask.pocoo.org/docs/api/
STATIC_FOLDER = '../assets'
TEMPLATE_FOLDER = 'templates'

# webassets bundle config:
# http://elsdoerfer.name/docs/webassets/loaders.html#loaders
BUNDLES_FILENAME = 'bundles.yaml'