"""
server/app.py

Initialize the Flask app, set up webasset bundling, and import the views.
"""
import os
import flask
from flask.ext.assets import Environment, Bundle
import webassets.loaders
import settings

# Create the Flask app.
app = flask.Flask(__name__,
    static_folder=settings.STATIC_FOLDER,
    template_folder=settings.TEMPLATE_FOLDER
)
app.config.from_object(settings)


# Load webassets bundles from a config file.
dirname = os.path.dirname(os.path.abspath(__file__)) + '/'
bundles_filename = dirname + settings.BUNDLES_FILENAME
bundles = webassets.loaders.YAMLLoader(bundles_filename).load_bundles()

# Register bundles, so we can include them in templates.
assets = Environment(app)
for name, bundle in bundles.iteritems():
    assets.register(name, bundle)


# Import views.
from views import *
from quotes import *


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=settings.DEBUG)