/**
 * Core.js
 *
 * Define some core base classes.
 */
(function(Backtester) {

    // Model base class, which binds a plugin to allow declarative validations,
    // validates on initialize (normally happens just on set/save), and throws errors.
    Backtester.Model = Backbone.Model.extend({

        initialize: function (attrs) {
            Backbone.Validation.bind(this);
            var err = this.validate(attrs);
            if (err) {
                throw new Error(err);
            }
        }
    });

    Backtester.View = Backbone.View.extend({

        renderTo: function (target) {
            $(target).html(this.render().el);
        },

        appendTo: function (target) {
            $(target).append(this.render().el);
        }
    });

    // View base class, which renders a JST template using its model values.
    Backtester.TemplateView = Backtester.View.extend({

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
        }
    });

})(Backtester);
