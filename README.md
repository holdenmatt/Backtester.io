# Backtester.io

Backtest asset allocations against historical data.

### Install

1. Clone this repo.
2. Run:

```
    $ virtualenv venv --distribute
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

Developed using my [webapp-boilerplate](https://github.com/holdenmatt/webapp-boilerplate),
with thanks to:

* https://github.com/tbranyen/backbone-boilerplate
* https://github.com/zachwill/flask_heroku
* https://github.com/miracle2k/webassets
