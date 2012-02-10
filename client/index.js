(function () {

    // Default 10 year horizon.
    var DEFAULT_HORIZON = 10;

    // Parse out query parameters.
    // http://james.padolsey.com/javascript/bujs-1-getparameterbyname/
    var getParameterByName = function(name, queryString) {
        queryString = queryString || window.location.search;

        var match = RegExp('(^|[?&])' + name + '=([^&]*)').exec(queryString);
        return match ? decodeURIComponent(match[2].replace(/\+/g, ' ')) : '';
    };

    // Parse tickers, percents, and horizon from the query args.
    var parseArgs = function (args) {

        var tickers  = getParameterByName('tickers', args).toUpperCase(),
            percents = getParameterByName('percents', args),
            horizon  = getParameterByName('horizon', args);

        // Split args into arrays, ignoring empty values.
        tickers = _.compact(tickers.split(',')),
        percents = _.compact(percents.split(','));

        horizon = parseInt(horizon || '10', DEFAULT_HORIZON);

        // Convert percents to numbers.
        percents = _.map(percents, function (percent) {
            return parseFloat(percent);
        });

        return {
            tickers: tickers,
            percents: percents,
            horizon: horizon
        };
    };

    // Return a new Portfolio.Model created from the query args.
    var getPortfolio = function (args) {
        args = parseArgs(args);

        return new Portfolio.Model({
            tickers: args.tickers,
            percents: args.percents,
            horizon: args.horizon
        });
    };

    // Load modules.
    var Portfolio = Backtester.module('Portfolio');

    // Define the application router.
    var Router = Backbone.Router.extend({
        routes: {
            'quotes/?:args': 'quotes',
            'returns/?:args': 'returns',
            'riskreward/?:args': 'riskreward'
        },

        // Show historical quotes for all portfolio constituents.
        quotes: function (args) {

            var portfolio = getPortfolio(args);
            new Portfolio.Views.Quotes({
                model: portfolio
            }).renderTo('#chart');
        },

        // Show annualized % returns, by starting year.
        returns: function (args) {
            var portfolio = getPortfolio(args);
            new Portfolio.Views.Returns({
                model: portfolio 
            }).renderTo('#chart');
        },

        // Show risk (std dev of yearly returns) vs reward annualized return.
        riskreward: function (args) {

            var portfolio = getPortfolio(args);
            new Portfolio.Views.RiskReward({
                model: portfolio 
            }).renderTo('#chart');
        },


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
