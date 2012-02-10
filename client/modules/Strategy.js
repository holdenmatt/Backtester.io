/**
 * Strategy.js
 *
 * Describe and backtest investment strategies.
 */
(function(Strategy) {


	var TimeSeries = Backtester.module('TimeSeries'),
		Quotes = Backtester.module('Quotes');


	// Backtest a given quotes/percents allocation in a single date range.
	// Return the TimeSeries of portfolio values for these dates.
	function backtestRange(quotes, percents, dates) {

		// Start with an initial amount, and rebalance annually.
		var initialAmount = 10000,
			rebalanceMonths = 12;

		// Start by allocating the initial amount.
		var start = dates[0],
			allocation = quotes.allocate(initialAmount, percents, start);

		// Compute the portfolio values over time.
		var values = [];
		_.each(dates, function (date, index) {
			// Rebalance periodically.
			if (index % rebalanceMonths == 0) {
				allocation = quotes.rebalance(allocation, percents, date);
			}

			value = quotes.valueOf(allocation, date);
			values.push(value);
		});

		return new TimeSeries.Model({
			dates: dates,
			values: values
		});
	}


	// Backtest all historical date ranges with a given time horizon (duration in years).
	function backtestAllRanges(quotes, percents, horizon) {

		var dates = quotes.dates(),
			start = 0,
			end = 12 * horizon;

		// Compute the risk (standard deviation) and return (% change) for each date range.
		var percentChange = [],
			deviation = [];

		while (end < allDates.length) {
			series = backtestRange(quotes, percents, dates.slice(start, end));
			percentChange.push(series.getPercentChange());
			deviation.push(series.getStandardDeviation());
		}

		return returns;
	}

	// Portfolio.Model
	// backtestRange(dates)
	// backtestAllRanges(horizon)
	// Portfolio.Views.Quotes (all ticker values)
	// Portfolio.Views.HistoricalReturns (% change bar graph by starting year)
	// Portfolio.Views.RiskVersusReturn (% change vs std dev)
	// Portfolio.Views.HistoricalBacktest (a single backtest -- value line graph, bar chart change).
	// async happens in render().


	// Describe an investment strategy, with initial amount and target allocation (tickers/percents).
	Strategy.Model = Backtester.Model.extend({

		validation: {
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

		// Backtest this Strategy against historical data, with a given horizon (in years).
		// Return results to an async success callback.
		backtest: function (success) {

			var tickers = this.get('tickers'),
				percents = this.get('percents');

			Quotes.fetch(tickers, {
				success: function (quotes) {
					var values = backtestRange(quotes, percents, quotes.dates());
					success.call(null, quotes, values.getValues());
				}
			});
		}
	});

})(Backtester.module('Strategy'));
