(function () {

    // Load modules.
    var Quotes      = Backtester.module('Quotes'),
        TimeSeries  = Backtester.module('TimeSeries'),
        Portfolio   = Backtester.module('Portfolio'),
        Charts      = Backtester.module('Charts');

    // Parse out query parameters.
    // http://james.padolsey.com/javascript/bujs-1-getparameterbyname/
    var getParameterByName = function(name, queryString) {
        queryString = queryString || window.location.search;

        var match = RegExp('(^|[?&])' + name + '=([^&]*)').exec(queryString);
        return match ? decodeURIComponent(match[2].replace(/\+/g, ' ')) : '';
    };

    // Define the application router.
    var Router = Backbone.Router.extend({
        routes: {
            'portfolio/?:args': 'portfolio'
        },

        portfolio: function (args) {

            var tickers  = getParameterByName('tickers', args).toUpperCase(),
                percents = getParameterByName('percents', args),
                horizon  = getParameterByName('horizon', args);

            // Split args into arrays, ignoring empty values.
            tickers = _.compact(tickers.split(',')),
            percents = _.compact(percents.split(','));

            horizon = parseInt(horizon || '10', 10);

            // Convert percents to numbers.
            percents = _.map(percents, function (percent) {
                return parseFloat(percent);
            });

            var portfolio = new Portfolio.Model({
                'tickers': tickers,
                'percents': percents,
                'horizon': horizon
            });

            // Clear any existing content.
            $('#main').html('');

            // Show historical quotes for all portfolio constituents.
            /*
            new Portfolio.Views.Quotes({
                model: portfolio
            }).appendTo('#main');
            */

            /*
            // Show annualized returns, by starting year.
            new Portfolio.Views.Returns({
                model: portfolio 
            }).appendTo('#main');
            */

            // Show risk vs reward.
            new Portfolio.Views.RiskReturn({
                model: portfolio 
            }).appendTo('#main');
        }
    });


    // Treat the jQuery ready function as the entry point to the application.
    // Inside this function, kick-off all initialization, everything up to this
    // point should be definitions.
    jQuery(function($) {

        // Update ticker on search.
        $('form.navbar-search').submit(function () {

            // Get (and clear) and search input value.
            var input = $(this).find('input'),
                href = 'graph/?tickers=' + input.val();
            input.val('');

            Backbone.history.navigate(href, true);
            return false;
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
})();
