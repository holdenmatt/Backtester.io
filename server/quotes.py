"""
quotes.py

Serve stock quotes fetched from Yahoo and cached in Redis.
"""
import csv
import urllib
import urllib2
import flask

from app import app


# Yahoo URL from which to fetch historical CSV data.
YAHOO_FINANCE_URL = 'http://ichart.yahoo.com/table.csv?%s'


@app.route('/quotes/<ticker>')
def quotes(ticker):
    """
    Return all available historical closing prices for a single ticker.
    """
    ticker = ticker.upper()
    prices, dates = fetch_closing_prices(ticker)

    # Return 404 if no data was found.
    if prices == None:
        flask.abort(404)

    return flask.jsonify(
        start=min(dates),
        end=max(dates),
        prices=prices
    )


def fetch_closing_prices(ticker):
    """
    Fetch all historical dates/prices from Yahoo for a given ticker.
    All prices are in cents.  Return None if no data was found.
    """

    # Fetch CSV data from Yahoo.
    try:
        query = urllib.urlencode({'s': ticker})
        url = YAHOO_FINANCE_URL % query
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

    return prices, dates