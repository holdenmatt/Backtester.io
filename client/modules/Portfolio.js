/**
 * Portfolio.js
 *
 * Describe and backtest a portfolio of securities.
 */
(function(Portfolio) {


	var TimeSeries = Backtester.module('TimeSeries'),
		Quotes = Backtester.module('Quotes');


	// Describe and backtest a portfolio allocation (tickers/percents).
	Portfolio.Model = Backtester.Model.extend({

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
			},
            horizon: {
                required: true,
                min: 2
            }
		},

		validate: function (attrs) {
			if (attrs.tickers.length !== attrs.percents.length) {
				return 'tickers/percents must have matching length';
			}
		},

        // Return a text description of the portfolio composition.
        getDescription: function () {
            var tickers = this.get('tickers'),
                percents = this.get('percents');

            if (tickers.length == 1) {
                return tickers[0];
            }
            if (tickers.length > 1) {
                return _.map(_.zip(tickers, percents), function (pair) {
                    return pair[0] + ' (' + pair[1] + '%)';
                }).join(', ');
            }
        },

		// Backtest this portfolio over a given date range.
		// Return the TimeSeries of portfolio values for these dates.
		backtestDates: function (dates) {

			var quotes = this.get('quotes'),
				percents = this.get('percents');

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

			var timeseries = new TimeSeries.Model({
				dates: dates,
				values: values
			});

			return timeseries;
		},

		// Backtest all historical date ranges with our given time horizon (in years).
		backtestHorizon: function (success) {

			var tickers = this.get('tickers'),
				percents = this.get('percents'),
                horizon = this.get('horizon'),
				self = this;

			Quotes.fetch(tickers, function (quotes) {
				self.set('quotes', quotes);

				var dates = quotes.dates(),
					start = 0,
					end = 12 * horizon;

				// Compute the risk (standard deviation) and return (% change) for each start date.
				var annualizedReturns = [],
					stdDeviations = [],
                    startDates = [];

				while (end < dates.length) {
					series = self.backtestDates(dates.slice(start, end));
					annualizedReturns.push(series.getAnnualizedReturn());
					stdDeviations.push(series.getStandardDeviation());
                    startDates.push(dates[start]);

					start += 12;
					end = start + (12 * horizon);
				}

				success.call(self, startDates, annualizedReturns, stdDeviations);
			});
		}
	});


    /*--- Views ---*/
    Portfolio.Views = {};


    // Return the time (ms since 1970) for a Date or date string.
    var getTime = function (date) {
        if (_.isString(date)){
            return Date.parse(date);
        }
        if (date instanceof Date) {
            return date.getTime();
        }
        throw new Error('Not a valid Date or date string: ' + date);
    };


    // Base class for all chart views.
    var Chart = Backtester.View.extend({

        // Apply some option defaults to all views.
        // Override these in subclasses or passed options.
        globalDefaults: {
            credits: {
                // Hide attribution string.
                enabled: false
            },
            plotOptions: {
                series: {
                    animation: {
                        duration: 500
                    }
                }
            }
        },

        initialize: function (options) {

            // Use $.extend to do a 'deep' recursive extend of options.
            this.options = $.extend(true, {}, this.globalDefaults, this.defaults, options);
            this.options.chart.renderTo = this.el;

            _.bindAll(this, 'draw');
        },

        draw: function () {
            this.chart = new Highcharts.Chart(this.options);
        }
    });


    // Show a chart of historical prices for all portfolio constituents.
    Portfolio.Views.Quotes = Chart.extend({

        defaults: {
            chart: {
                type: 'line'
            },
            legend: {
                align: 'right',
                verticalAlign: 'top',
                floating: true
            },
            tooltip: {
                // Shared crosshairs for x-axis only.
                crosshairs: true,
                shared: true
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: '$'
                },
                min: 0
            },
            plotOptions: {
                line: {
                    lineWidth: 2,
                    marker: {
                        enabled: false
                    }
                }
            }
        },

        render: function () {
            var options = this.options,
                self = this;

            Quotes.fetch(this.model.get('tickers'), function (quotes) {

                var dates = quotes.dates();
                options.title = {
                    text: 'Historical values'
                };
                options.subtitle = {
                    text: _.first(dates) + ' to ' + _.last(dates)
                };

                options.series = quotes.map(function (timeseries) {
                    // Convert dates to timestamps, and zip dates/values together.
                    var dates = _.map(timeseries.get('dates'), getTime),
                        values = timeseries.getValues(),
                        data = _.zip(dates, values);

                    return {
                        name: timeseries.get('ticker'),
                        data: data
                    };
                });

                self.draw();
            });

            return this;
        }
    });


    // Show a chart of annualized % returns for a time horizon, by starting year.
    Portfolio.Views.Returns = Chart.extend({

        defaults: {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Annualized Return'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: '%'
                }
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            }
        },

        render: function () {
            var options = this.options,
                self = this;

            this.model.backtestHorizon(function (startDates, annualizedReturns, stdDeviations) {
                options.subtitle = {
                    text: this.get('horizon') + ' year horizon, by starting date'
                };

                startDates = _.map(startDates, getTime);
                options.series = [
                    {
                        name: 'Annualized Return (%)',
                        data: _.zip(startDates, annualizedReturns)
                    },
                    {
                        name: 'Std Dev 1-Year Returns (%)',
                        data: _.zip(startDates, stdDeviations)
                    }
                ];

                self.draw();
            });

            return this;
        }
    });


    // Render a scatter plot showing risk (std dev of 1-year returns)
    // vs reward (annualized returns) for a time horizon.
    Portfolio.Views.RiskReward = Chart.extend({

        defaults: {
            chart: {
                type: 'scatter'
            },
            title: {
                text: 'Risk vs. Return'
            },
            xAxis: {
                title: {
                    text: 'Std Dev 1-Year Returns (%)'
                }
            },
            yAxis: {
                title: {
                    text: 'Annualized Return (%)'
                }
            }
        },

        render: function () {
            var options = this.options,
                portfolio = this.model,
                self = this;

            portfolio.backtestHorizon(function (startDates, annualizedReturns, stdDeviations) {
                options.subtitle = {
                    text: this.get('horizon') + ' year horizon'
                };
                options.series = [{
                    data: _.zip(stdDeviations, annualizedReturns),
                    name: portfolio.getDescription()
                }];

                self.draw();
            });

            return this;
        }
    });


})(Backtester.module('Portfolio'));
