'use strict';

module.exports = function(app) {
	var servicecategories = require('../../app/controllers/servicecategories.server.controller');

	// ServiceCategories Routes
	app.route('/servicecategories')
		.get(servicecategories.list)
		.post(servicecategories.create);

	app.route('/servicecategories/:servicecategoryId')
		.get(servicecategories.read)
		.put(servicecategories.update)
		.delete(servicecategories.delete);

	// Finish by binding the ServiceCategory middleware
	app.param('servicecategoryId', servicecategories.servicecategoryByID);
};
