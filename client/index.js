// Treat the jQuery ready function as the entry point to the application.
// Inside this function, kick-off all initialization, everything up to this
// point should be definitions.
jQuery(function($) {

    var Quotes = Backtester.module('Quotes');

    var Router = Backbone.Router.extend({
        routes: {
            'graph/:ticker': 'graph'
        },

        graph: function (ticker) {
            Quotes.fetch(ticker);
            console.log('graph', ticker);
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