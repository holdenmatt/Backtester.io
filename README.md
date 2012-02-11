# Backtester.io

Backtest asset allocations against historical data.

Purpose: learn some new web technologies, and help me rebalance my portfolio.

Client:

* Backbone.js
* Twitter Bootstrap 2.0
* jQuery, HighCharts, Underscore...

Server:

* Flask / Python
* Hosted on Heroku


### Install

1. Clone this repo.
2. Run:

```
    $ virtualenv venv --distribute --no-site-packages
    $ source venv/bin/activate
    $ pip install -r requirements.txt
```

### Run locally

```
$ (gem install foreman)
$ foreman start
```

### Deploy to Heroku

http://devcenter.heroku.com/articles/python

```
$ heroku login
$ heroku create --stack cedar
$ git push heroku master
```

### Thanks

Developed from my [webapp-boilerplate](https://github.com/holdenmatt/webapp-boilerplate),
with thanks to:

* https://github.com/tbranyen/backbone-boilerplate
* https://github.com/zachwill/flask_heroku
* https://github.com/miracle2k/webassets
