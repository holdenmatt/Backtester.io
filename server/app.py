"""
app.py

Initialize the Flask app, set up webasset bundling, and import the views.
"""
import os
import flask
from flask.ext.assets import Environment, Bundle
import webassets.loaders


DEBUG = True


# Create the Flask app.
app = flask.Flask(__name__)
app.root_path = os.path.join(os.path.dirname(__file__), '..')


# Load webassets bundles from a config file.
BUNDLES_FILENAME = 'bundles.yaml'
bundles = webassets.loaders.YAMLLoader(BUNDLES_FILENAME).load_bundles()


# Merge files in debug mode, but don't apply filters.
assets = Environment(app)

# assets.cache = False
# assets.updater = 'always'
if DEBUG:
    assets.debug = 'merge'

for name, bundle in bundles.iteritems():
    # Register bundles, so we can include them in templates.
    assets.register(name, bundle)

    # Disable debug mode for JST filters.
    JSTFilter = webassets.filter.jst.JSTFilter
    if any([isinstance(f, JSTFilter) for f in bundle.filters]):
        bundle.debug = False


# Import views.
from views import *
from quotes import *


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=DEBUG)