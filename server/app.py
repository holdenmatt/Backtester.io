"""
app.py

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

# Merge files in debug mode, but don't apply filters.
assets = Environment(app)
if settings.DEBUG:
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
    app.run(host='0.0.0.0', port=port, debug=settings.DEBUG)