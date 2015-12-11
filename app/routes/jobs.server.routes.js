'use strict';

module.exports = function(app) {
	var jobs = require('../../app/controllers/jobs.server.controller'),
		users = require('../../app/controllers/users.server.controller');

	// Jobs admin routes
	app.route('/jobs-admin')
		.get(jobs.list)
		.post(users.requiresLogin, users.isAdmin, jobs.create);

	app.route('/jobs-admin/:jobId')
		.get(jobs.read)
		.put(users.requiresLogin, users.isAdmin, jobs.update)
		.delete(users.requiresLogin, users.isAdmin, jobs.delete);

	app.param('jobId', jobs.findJobByID);

	app.route('/jobs-admin/:currentPage/:itemsPerPage').get(jobs.listByPage);

	// Jobs routes
	app.route('/jobs').post(users.requiresLogin, jobs.create);
	app.route('/jobs/:jobId')
		.get(jobs.read)
		.put(users.requiresLogin, jobs.update);

	app.route('/jobs-by-user/:jobUserId/:status').get(jobs.search);
	app.param('jobUserId', jobs.listByUser);

	app.route('/jobs-by-servicesupplier/:servicesSupplierId').get(jobs.search);
	app.param('servicesSupplierId', jobs.listByServiceSupplier);
};
