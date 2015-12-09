'use strict';

module.exports = function(app) {
	var servicecategories = require('../../app/controllers/servicecategories.server.controller'),
		users = require('../../app/controllers/users.server.controller');

	// ServiceCategories admin routes
	app.route('/servicecategories-admin')
		.get(servicecategories.list)
		.post(users.requiresLogin, users.isAdmin, servicecategories.create);

	app.route('/servicecategories-admin/:servicecategoryId')
		.get(servicecategories.read)
		.put(users.requiresLogin, users.isAdmin, servicecategories.update)
		.delete(users.requiresLogin, users.isAdmin, servicecategories.delete);

	app.param('servicecategoryId', servicecategories.servicecategoryByID);

	app.route('/servicecategories-admin/:currentPage/:itemsPerPage').get(servicecategories.listByPage);

	// ServiceCategories routes
	app.route('/servicecategories').get(servicecategories.list);
	app.route('/servicecategories/:currentPage/:itemsPerPage').get(servicecategories.listByPage);
};
