"""
server/views.py

Define the server routes.
"""
from flask import render_template
from app import app

@app.route('/')
def home():
    """Render home page."""
    return render_template('home.html')

@app.route('/about/')
def about():
    """Render the about page."""
    return render_template('about.html')

@app.route('/<file_name>.txt')
def send_text_file(file_name):
    """Send a static text file."""
    file_dot_text = file_name + '.txt'
    return app.send_static_file(file_dot_text)

@app.after_request
def add_header(response):
    """
    Add headers to force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    # response.headers['Cache-Control'] = 'public, max-age=600'
    return response

@app.errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404
