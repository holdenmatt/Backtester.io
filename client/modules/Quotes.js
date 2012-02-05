/**
 * Quotes.js
 *
 * Manage historical quotes fetched from the quote server.
 */
(function(Quotes) {

	/**
	 * Store a monthly date/price timeseries for a single ticker.
	 */
	Quotes.TickerSeries = Backtester.Model.extend({
		validation: {
			ticker: {
				required: true,
				pattern: '[A-Z]+'
			},
			dates: {
				required: true
			},
			prices: {
				required: true
			}
		}
	});


	/**
	 * Fetch a collection of TickerSeries from the quote server, using a required 'tickers' options.
	 */
	Quotes.TickerSeriesCollection = Backbone.Collection.extend({

		model: Quotes.TickerSeries,
		baseUrl: '/quotes/monthly?s=',

		initialize: function (models, options) {
			options = options || {};
			if (!options.tickers) {
				throw new Error('Missing required option: tickers');
			}
			if (!_.isArray(options.tickers)) {
				throw new Error('tickers must be an array');
			}

			// Append tickers to the URL from which to fetch quotes.
			this.url = this.baseUrl + options.tickers.join(',');
		}
	});


	// Fetch all monthly quotes for some given tickers.
	Quotes.fetch = function (tickers) {

		var collection = new Quotes.TickerSeriesCollection([], {
			'tickers': tickers
		});

		collection.fetch({
			success: function (collection, response) {

			},
			error: function () {

			}
		});
	}

})(Backtester.module('Quotes'));
