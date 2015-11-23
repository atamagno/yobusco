'use strict';

module.exports = function(app) {
	var reviews = require('../../app/controllers/reviews.server.controller'),
		ratingtypes = require('../../app/controllers/ratingtypes.server.controller');

	// Reviews Routes
	app.route('/reviews').post(reviews.create);

	// RatingTypes Routes
	app.route('/ratingtypes').get(ratingtypes.list);
};
