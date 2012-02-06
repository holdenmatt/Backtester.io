/**
 * TimeSeries.js
 *
 * Model a timeseries of dates/values, and provide several graphical views.
 */
(function(TimeSeries) {

	/**
	 * A single TimeSeries of dates/values, with a name.
	 * Provides functions to return corresponding Google Visualization DataTables.
	 */
	TimeSeries.Model = Backtester.Model.extend({

		// Parse date values using this format.
		dateFormat: 'YYYY-MM-DD',
		datePattern: /\d{4}-\d{2}-\d{2}/,

		defaults: {
			name: ''
		},

		validation: {
			name: {

			},
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

		// Return the values to use in a DataTable.
		getValues: function () {
			return this.get('values');
		},

		// Return a google.visualization.DataTable for this TimeSeries.
		getDataTable: function () {

			var dates  = this.getDates(),
				values = this.getValues(),
				name   = this.get('name');

			var data = new google.visualization.DataTable();
	        data.addColumn('date', 'Date');
			data.addColumn('number', name);
	        data.addRows(_.zip(dates, values));

	        return data;
		},

		// Return only the values (no dates) in a DataTable.
		getValuesTable: function () {

			var values = this.getValues(),
				name   = this.get('name');

			var data = new google.visualization.DataTable();
			data.addColumn('number', name);
	        data.addRows(_.zip(values));

	        return data;
		}
	});


	/*--- Chart Views ---*/


    /**
     * The Chart base class draws itself as soon as the chart API has loaded.
     */
	var Chart = Backtester.View.extend({

		afterRender: function () {

			var view = this;
			if (Chart.ready) {
				// Draw immediately if the API is ready.
				view.draw();
			} else {
				// Draw once it's loaded.
				Backtester.app.on('google.visualization:loaded', function () {
					Chart.ready = true;
					view.draw();
				});
			}
			return this;
		},

		draw: function () {
			// Subclasses implement this.
		}
	}, {
		// Has the Google Chart API loaded yet?
		ready: false
	});


	/**
	 * Render a TimeSeries as a simple sparkline image.
	 */
	TimeSeries.SparkLine = Chart.extend({
		className: 'SparkLine',

		draw: function () {

			var data = this.model.getValuesTable();
	        this.chart = new google.visualization.ImageSparkLine(this.el);
		    this.chart.draw(data, {
	    	    width: 120,
	    	    height: 40,
	    	    showAxisLines: false,
	    	    labelPosition: 'left'
	    	});
		}
	});


	/**
	 * Render a collection of TimeSeries on an interactive timeline.
	 */
	TimeSeries.AnnotatedTimeLine = Chart.extend({
		className: 'AnnotatedTimeLine',

		initialize: function (options) {
			this.$el.css({
				width: 700,
				height: 250
			});
		},

		draw: function () {

	        var data = this.model.getDataTable();
	        this.chart = new google.visualization.AnnotatedTimeLine(this.el);
	        this.chart.draw(data, {
	        	
	        });
		}
	});

})(Backtester.module('TimeSeries'));
