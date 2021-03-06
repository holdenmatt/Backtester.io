/**
 * Quotes.js
 *
 * Fetch and cache monthly historical closing price timeseries from the server.
 */
(function(Quotes) {

	var TimeSeries = Backtester.module('TimeSeries');

	/**
	 * Fetch a Collection of monthly closing price TimeSeries for one or more tickers.
	 */
	Quotes.MonthlyQuotes = TimeSeries.Collection.extend({
		baseUrl: '/quotes/monthly/?s=',

		// Convert cents to dollars.
		model: TimeSeries.Model.extend({
			getValues: function () {
				return _.map(this.get('values'), function (value) {
					return value / 100.0;
				});
			}
		}),

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



	// Privately cache a Collection of monthly quotes TimeSeries models for some given tickers.
	var cache = new Backbone.Collection();

	// Use tickers as ids when cacheing, so we can lookup by ticker.
	cache.addModels = function (models) {
		var toAdd = [],
			self = this;
		_.each(models, function (model) {
			var id = model.get('ticker');
			if (!self.get(id)) {
				model.set('id', id);
				self.add(model);
			}
		});
	};

	// Return a TimeSeries.Collection for some given tickers.
	// Throw an error if any ticker hasn't already been cached.
	cache.getCollection = function (tickers) {

		var models = _.map(tickers, function (ticker) {
			var model = cache.get(ticker);
			if (!model) {
				throw new Error('Model not found in cache: ' + ticker);
			}
			return model;
		});
		return new TimeSeries.Collection(models);
	};


	/**
	 * Fetch and cache monthly quotes for an array of tickers.
	 * Return the collection using a success callback.
	 */
	Quotes.fetch = function (tickers, success) {

		// Get the tickers we don't have in the cache.
		var cached  = cache.pluck('id'),
			missing = _.difference(tickers, cached);

		console.log('Cached: [' + cached + ']');

		// If everything we need is already cached, just return the collection.
		if (missing.length === 0) {
			success.call(null, cache.getCollection(tickers));
			return;
		}

		console.log('Fetching: [' + missing + ']');

		// Otherwise, fetch what we need to add to the cache.
		var collection = new Quotes.MonthlyQuotes([], {
			'tickers': missing
		});
		collection.fetch({
			success: function (collection) {
				// Save the fetched results in the cache, and return the complete collection.
				console.log('Success: [' + tickers + ']');
				cache.addModels(collection.models);
				success.call(null, cache.getCollection(tickers));
			},
			error: function () {
				alert('Error!');
			}
		});
	};

})(Backtester.module('Quotes'));
