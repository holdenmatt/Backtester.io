/**
 * TimeSeries.js
 *
 * Model a timeseries of dates/values.
 */
(function(TimeSeries) {

	/**
	 * A single TimeSeries of dates/values, with a name.
	 */
	TimeSeries.Model = Backtester.Model.extend({

		// Parse date values using this format.
		dateFormat: 'YYYY-MM-DD',
		datePattern: /\d{4}-\d{2}-\d{2}/,

		defaults: {
			name: ''
		},

		validation: {
			dates: {
				required: true,
				fn: function (dates) {
					var invalid = _.map(dates, function (date) {
						return !date.match(this.datePattern);
					}, this);
					if (_.any(invalid)) {
						return 'Invalid date string (' + this.dateFormat + ' is required)';
					}
				}
			},
			values: {
				required: true
			}
		},

		validate: function (attrs) {
			var dates = attrs.dates || this.get('dates') || [],
				values = attrs.values || this.get('values') || [];

			if (dates.length !== values.length) {
				return 'dates/values must have matching lengths';
			}
		},

		// Return the dates to use in a DataTable.
		// We store them as date strings, but convert them to JavaScript Date objects as needed.
		getDates: function () {
			var format = this.dateFormat;
			return _.map(this.get('dates'), function (date) {
				return moment(date, format).toDate();
			});
		},

		getValues: function () {
			return this.get('values');
		},

        // Return the % change from the first to last values.
        getPercentChange: function () {
            var values = this.get('values');
                first = values[0],
                last = values[values.length - 1];
            return 100.0 * last / first;
        },

        getVariance: function () {

            var values = this.get('values'),
                mean = _.sum(values) / values.length;

            return _.sum(_.map(values, function (value) {
                return (value - mean) * (value - mean);
            }));
        },

        getStandardDeviation: function () {
            return Math.sqrt(this.getVariance());
        }
	});


	TimeSeries.Collection = Backbone.Collection.extend({
		model: TimeSeries.Model,

		// Are all TimeSeries in this collection defined on a given date?
		isDefined: function (date) {
			for (var i = 0; i < this.length; i++) {
				if (!_.contains(this.at(i).get('dates'), date)) {
					return false;
				}
			}
			return true;
		},

		// Return the dates on which all TimeSeries have values.
		dates: function () {
			if (!this._dates) {
				var firstDates = this.first().get('dates');

				// Advance start until all are defined.
				var start = 0;
				while (start < firstDates.length && !this.isDefined(firstDates[start])) {
					start += 1;
				}

				// Now advance end until no longer defined.
				var end = start;
				while (end < firstDates.length && this.isDefined(firstDates[end])) {
					end += 1;
				}

				this._dates = firstDates.slice(start, end);
			}
			return this._dates;
		},

		// Return the arrays of corresponding values over the defined date range.
		values: function () {
			if (!this._values) {
				var range = this.dates();
				this._values = this.map(function (series) {

					var dates = series.get('dates'),
						start = _.indexOf(dates, range[0], true),
						end = start + range.length;

					return series.get('values').slice(start, end);
				});
			}
			return this._values;
		},

		length: function () {
			return this.values().length;
		},

		// Return the index of the first date in this series >= a given date.
		dateIndex: function (date) {

			var dates = this.dates(),
				start = dates[0],
				end = dates[dates.length - 1];

			if (date < start || date > end) {
				throw new Error('Date out of range: ' + date);
			}

			return _.sortedIndex(dates, date);
		},

		// Convert a given amount of cash into a percent allocation on a given date.
		// Return the allocation array (corresponding share quantities).
		allocate: function (amount, percents, date) {

			// Get values on this date.
			var index = this.dateIndex(date),
				values = _.pluck(this.values(), index);

			var allocation = [],
				total, quantity;

			for (var i = 0; i < percents.length; i++) {
				// Get the target value and share quantity for this ticker.
				total = amount * percents[i] / 100.0;
				quantity = total / values[i];
				allocation.push(quantity);
			}

			return allocation;
		},

		// Convert an allocation array (share quantities) into a total market value on a given date.
		valueOf: function (allocation, date) {

			// Get values on this date.
			var index = this.dateIndex(date),
				values = _.pluck(this.values(), index);

			// Return the value of this allocation.
			return _.dotProduct(allocation, values);
		},

		// Rebalance a given allocation array (share quantities) to target percents on a given date.
		// Return the new allocation array.
		rebalance: function (allocation, percents, date) {
			var amount = this.valueOf(allocation, date);
			return this.allocate(amount, percents, date);
		}
	});

})(Backtester.module('TimeSeries'));
