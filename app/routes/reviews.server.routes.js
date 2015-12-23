'use strict';

module.exports = function(app) {
	var reviews = require('../../app/controllers/reviews.server.controller'),
		ratingtypes = require('../../app/controllers/ratingtypes.server.controller'),
		users = require('../../app/controllers/users.server.controller');

	// Reviews admin routes
	app.route('/reviews-admin')
		.get(reviews.list)
		.post(users.requiresLogin, users.isAdmin, reviews.create);

	app.route('/reviews-admin/:reviewId')
		.get(reviews.read)
		.put(users.requiresLogin, users.isAdmin, reviews.update)
		.delete(users.requiresLogin, users.isAdmin, reviews.delete);

	app.param('reviewId', reviews.reviewByID);

	app.route('/reviews-admin/:currentPage/:itemsPerPage').get(reviews.listByPage);

	// Reviews routes
	app.route('/reviews').post(users.requiresLogin, reviews.create);
	app.route('/reviews-by-servicesupplier/:serviceSupplierId').get(reviews.listByServiceSupplier);
	app.route('/reviews-by-job/:jobId').get(reviews.listByJob);
};
