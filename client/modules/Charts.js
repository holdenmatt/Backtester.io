/**
 * Charts.js
 *
 * Render charts in several styles, using Highcharts.
 */
(function(Charts) {


	// Format a currency.
	Charts.formatCurrency = function (amount) {
		return '$' + Highcharts.numberFormat(amount, 2);
	};

	// Format a date.
	Charts.formatDate = function (timestamp) {
		return Highcharts.dateFormat('%b %Y', timestamp);
	};


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


	/**
	 * Render a chart using Highcharts, with some reasonable defaults.
	 */
	Charts.Chart = Backtester.View.extend({

		defaults: {
			chart: {
				type: 'line'
			},
			credits: {
				// Hide attribution string.
				enabled: false
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
			plotOptions: {
				line: {
					lineWidth: 2,
					marker: {
						enabled: false
					}
				}
			},
		    xAxis: {
		        type: 'datetime'
		    },
		    yAxis: {
		    	title: {
		    		text: 'Value ($)'
		    	},
		    	min: 0
		    }
		},

		initialize: function (options) {

			// If a series has dates/values, get data by zipping them together.
			options.series = _.map(options.series, function (series) {
				if (!series.data && series.dates && series.values) {

					// Convert dates, and zip dates/values together.
					var dates = _.map(series.dates, getTime);
					series.data = _.zip(dates, series.values);
				}

				return series;
			});

			this.options = _.extend({}, this.defaults, options);
		},

		afterRender: function () {
			this.options.chart.renderTo = this.el;
			this.chart = new Highcharts.Chart(this.options);
		}
	});


	// TODO:
	// chart.showLoading();


})(Backtester.module('Charts'));
