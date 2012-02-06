"""
quotes.py

Serve monthly stock quotes fetched from Yahoo and cached in Redis.
"""
import csv
import urllib
import urllib2
import flask
import json as JSON

from app import app


# Yahoo Finance URL from which to fetch historical monthly quotes as CSV.
YAHOO_QUOTES_URL = (
    'http://ichart.yahoo.com/table.csv?' +
    's=%s'  # Ticker symbol.
    '&g=m'  # Monthly quotes.
)


@app.route('/quotes/monthly/')  # ?s=vfinx,vbmfx
def quotes():
    """
    Return monthly closing prices for one or more ticker symbols.
    """

    # Split tickers from the s= query arg.
    tickers = flask.request.args.get('s', '').upper().split(',')

    # Fetch dates/prices for each ticker.
    quotes = []
    for ticker in tickers:
        prices, dates = fetch_monthly_prices(ticker)

        # 404 if any ticker doesn't have data.
        if prices == None:
            flask.abort(404)

        quotes.append({
            'name': ticker,
            'dates': dates,
            'values': prices
        })

    json = JSON.dumps(quotes, indent=2)
    return flask.Response(json, mimetype='application/json')


def fetch_monthly_prices(ticker):
    """
    Fetch all monthly historical dates/prices from Yahoo for a given ticker.
    All prices are in cents.  Return None if no data was found.
    """

    # Fetch CSV data from Yahoo.
    try:
        url = YAHOO_QUOTES_URL % urllib.quote(ticker)
        data = urllib2.urlopen(url)
    except urllib2.HTTPError:
        return None, None

    # Extract dates and closing prices.
    reader = csv.DictReader(data)
    dates = []
    prices = []
    for row in reader:
        date, price = row['Date'], row['Close']

        # Convert price to cents.
        price = int(100 * float(price))

        dates.append(date)
        prices.append(price)

    # Reverse the lists, so dates are in order.
    prices.reverse()
    dates.reverse()

    return prices, dates