// Treat the jQuery ready function as the entry point to the application.
// Inside this function, kick-off all initialization, everything up to this
// point should be definitions.
jQuery(function($) {

    // Google APIs should be loaded once the DOM is ready.
    google.load('visualization', '1', {
        packages: [
            'annotatedtimeline',
            'imagesparkline'
        ],
        callback: function () {
            // Tell listeners that we're loaded.
            Backtester.app.trigger('google.visualization:loaded');
        }
    });


    var TimeSeries = Backtester.module('TimeSeries');

    var Router = Backbone.Router.extend({
        routes: {
            'graph/:ticker': 'graph'
        },

        graph: function (ticker) {
            TimeSeries.fetchMonthlyQuotes([ticker], {
                success: function (collection) {
                    collection.each(function (timeseries) {
                        new TimeSeries.SparkLine({
                            model: timeseries
                        }).appendTo('#main');

                        new TimeSeries.AnnotatedTimeLine({
                            model: timeseries
                        }).appendTo('#main');
                    });
                }
            });
        }
    });

    // Create the master router, and trigger the initial route (with option HTML5 History API support).
    Backtester.app.router = new Router();
    Backbone.history.start({ pushState: false });

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router.  If the link has a data-bypass
    // attribute, bypass the delegation completely.
    $(document).on('click', 'a:not([data-bypass])', function(evt) {

        var href = $(this).attr('href');
        var protocol = this.protocol + '//';

        // Ensure the protocol is not part of URL, meaning its relative.
        if (href && href.slice(0, protocol.length) !== protocol) {

            // Prevent a page refresh.
            evt.preventDefault();
            Backbone.history.navigate(href, true);
        }
    });
});
