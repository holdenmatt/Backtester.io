/**
 * Strategy.js
 *
 * Describe and backtest investment strategies.
 */
(function(Strategy) {

	var Quotes = Backtester.module('Quotes');


	// Describe an investment strategy, with initial amount and target allocation (tickers/percents).
	Strategy.Model = Backtester.Model.extend({

		validation: {
			initialAmount: {
				required: true,
				min: 0
			},
			tickers: {
				required: true,
				fn: function (value) {
					if (!_.isArray(value)) {
						return 'tickers must be an array';
					}
				}
			},
			percents: {
				required: true,
				fn: function (value) {
					if (!_.isArray(value)) {
						return 'percents must be an array';
					}
					for (var i=0; i < value.length; i++) {
						if (!_.isNumber(value[i])) {
							return 'percents must be numbers';
						}
					}

					// Check that percents sum to 100% (to the nearest basis point).
					var sum = _.sum(value),
						basisPoints = Math.round(100 * sum);
					if (basisPoints !== 10000) {
						return 'percents must sum to 100%'
					}
				}
			}
		},

		validate: function (attrs) {
			if (attrs.tickers.length !== attrs.percents.length) {
				return 'tickers/percents must have matching length';
			}
		},

		// Backtest this Strategy against historical data from a given date range.
		// Return results to an async success callback.
		backtest: function (success) {

			var initialAmount = this.get('initialAmount'),
				tickers = this.get('tickers'),
				percents = this.get('percents');

			Quotes.fetch(tickers, {
				success: function (quotes) {

					// Start by allocating the initial amount.
					var dates = quotes.dates(),
						start = dates[0],
						allocation = quotes.allocate(initialAmount, percents, start);

					// Record portfolio values and allocation over time.
					var values = [],
						allocations = [];

					// Compute the values and allocations, with periodic rebalancing.
					_.each(dates, function (date, index) {
						// Rebalance every 12 months.
						if (index % 12 == 0) {
							allocation = quotes.rebalance(allocation, percents, date);
						}

						value = quotes.valueOf(allocation, date);
						values.push(value);
						allocations.push(allocation);
					});

					success.call(null, quotes, values, allocations);
				}
			});
		}
	});

})(Backtester.module('Strategy'));
