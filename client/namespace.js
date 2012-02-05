this.Backtester = {

    // Keep active application instances namespaced under an app object.
    app: _.extend({}, Backbone.Events),


    // Organize logical components of code into modules.
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
    }(),


    // Model base class, which binds a plugin to allow declarative validations,
    // validates on initialize (normally happens just on set/save), and throws errors.
    Model: Backbone.Model.extend({

        initialize: function (attrs) {
            Backbone.Validation.bind(this);
            var err = this.validate(attrs);
            if (err) {
                throw new Error(err);
            }
        }
    }),

    // View base class, which renders a JST template using its model values.
    TemplateView: Backbone.View.extend({

        render: function () {

            var JST = window.JST || {};
            if (!JST) {
                throw new Error('JST templates not found')
            }
            if (!this.template) {
                throw new Error('TemplateView must define a template');
            }

            var template = JST[this.template];
            if (!template) {
                throw new Error('Template not found: ' + this.template);
            }

            var values = this.model ? this.model.toJSON() : {};
            var html = template(values);
            this.$el.html(html);

            return this;
        },

        renderTo: function (target) {
            $(target).html(this.render().el);
        }
    })
};