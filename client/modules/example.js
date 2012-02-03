(function(Example) {

  Example.Model = Backbone.Model.extend({ /* ... */ });
  Example.Collection = Backbone.Collection.extend({ /* ... */ });
  Example.Router = Backbone.Router.extend({ /* ... */ });


  Example.View = Backtester.TemplateView.extend({
    template: "example"
  });

})(Backtester.module("example"));