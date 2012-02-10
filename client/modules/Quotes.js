/**
 * Quotes.js
 *
 * Fetch and cache monthly historical closing price timeseries from the server.
 */
(function(Quotes) {


	var TimeSeries = Backtester.module('TimeSeries');


	/**
	 * Extend TimeSeries to specialize it for monthly stock quotes.
	 */
	Quotes.TimeSeries = TimeSeries.Model.extend({

		initialize: function (attrs) {

			// Use the ticker as the model id.
			this.set({
				'id': this.get('ticker')
			});

			TimeSeries.Model.prototype.initialize.apply(this, arguments);
		},

		// Override getValues to convert cents to dollars.
		getValues: function () {
			return _.map(this.get('values'), function (value) {
				return value / 100.0;
			});
		}
	});


	/**
	 * Fetch/manage a collection of montly closing price TimeSeries for one or more tickers.
	 */
	Quotes.MonthlyQuotes = TimeSeries.Collection.extend({

		model: Quotes.TimeSeries,
		baseUrl: '/quotes/monthly/?s=',

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


	// Cache all monthly quotes results fetched from the server.
	Quotes.cache = new Backbone.Collection();


	// Return a Collection from the cache for an array of tickers.
	// Throw an error if any ticker isn't in the cache.
	Quotes.cache.getCollection = function (tickers) {
		var models = _.map(tickers, function (ticker) {
			var model = Quotes.cache.get(ticker);
			if (!model) {
				throw new Error('Model not found in cache: ' + ticker);
			}
			return model;
		});
		return new TimeSeries.Collection(models);
	};

	/**
	 * Fetch and cache monthly quotes for an array of tickers.
	 * Use success/error callbacks to return the collection.
	 */
	Quotes.fetch = function (tickers, options) {
		options = options || {};

		// Get the tickers we don't have in the cache.
		var cached = Quotes.cache.pluck('id'),
			needed = _.difference(tickers, cached);

		console.log('Cached: [' + cached + ']');

		// If everything we need is already cached, just return the collection.
		if (needed.length === 0) {
			options.success(Quotes.cache.getCollection(tickers));
			return;
		}

		console.log('Fetching: [' + needed + ']');

		// Otherwise, fetch what we need to add to the cache.
		var collection = new Quotes.MonthlyQuotes([], {
			'tickers': needed
		});
		collection.fetch({
			success: function (collection) {
				// Save the returned results in the cache, and return the desired collection.
				Quotes.cache.add(collection.models);
				options.success(Quotes.cache.getCollection(tickers));
			},
			error: options.error || function () {
				alert('Error!');
			}
		});
	};

})(Backtester.module('Quotes'));
