'use strict';

module.exports = function(app) {
	var reviews = require('../../app/controllers/reviews.server.controller'),
		ratingtypes = require('../../app/controllers/ratingtypes.server.controller');

	// Reviews Routes
	app.route('/reviews')
		.get(reviews.list)
		.post(reviews.create);

	app.route('/reviews/:reviewId')
		.get(reviews.read)
		.put(reviews.update)
		.delete(reviews.delete);

	app.param('reviewId', reviews.reviewByID);

	app.route('/reviews/:currentPage/:itemsPerPage').get(reviews.listByPage);

	app.route('/reviews-by-servicesupplier/:serviceSupplierId').get(reviews.search);
	app.param('serviceSupplierId', reviews.listByServiceSupplier);

	// RatingTypes Routes
	app.route('/ratingtypes').get(ratingtypes.list);
};
