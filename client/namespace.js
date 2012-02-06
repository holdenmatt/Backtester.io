/**
 * namespace.js
 *
 * Define the global app namespace, and module factory method.
 */
this.Backtester = {

    // Keep active application instances namespaced under an app object.
    app: _.extend({}, Backbone.Events),

    module: function() {
        // Internal module cache.
        var modules = {};

        // Create a new empty module or load an existing module.
        return function(name) {
            if (modules[name]) {
                return modules[name];
            }
            return modules[name] = {};
        };
    }()
};
