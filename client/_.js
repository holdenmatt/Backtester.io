
/**
 * _.js
 *
 * Configure underscore.js settings, and add a few convenient utility mixins.
 */
(function (_) {

    // Use Mustache-style templates.
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
    };

    _.mixin({

    	// Sum elements of an array.
    	sum: function(obj) {
			if (!_.isArray(obj) || obj.length == 0) {
				return 0;
			}
  			return _.reduce(obj, function(sum, n) {
    			return sum += n;
  			});
		},

		// Return the dot product of two numeric arrays.
		dotProduct: function (array1, array2) {
			if (array1.length !== array2.length) {
				throw new Error('array1/array2 must have the same length');
			}

			return _.sum(_.map(_.zip(array1, array2), function (values) {
				return values[0] * values [1];
			}));
		}
    });

})(_);
