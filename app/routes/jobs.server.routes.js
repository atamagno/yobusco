'use strict';

module.exports = function(app) {
	var jobs = require('../../app/controllers/jobs.server.controller');

	// Jobs Routes
	app.route('/jobs')
		.get(jobs.list)
		.post(jobs.create);

	app.route('/jobs/:jobId')
		.get(jobs.read)
		.put(jobs.update)
		.delete(jobs.delete);

	app.param('jobId', jobs.findJobByID);
	app.route('/jobs/:currentPage/:itemsPerPage').get(jobs.listByPage);

	app.route('/jobs-by-user/:userId').get(jobs.search);
	app.route('/jobs-by-user/:userId/:status').get(jobs.search);
	app.param('userId', jobs.listByUser);

	app.route('/jobs-by-servicesupplier/:servicesSupplierId').get(jobs.search);
	app.param('servicesSupplierId', jobs.listByServiceSupplier);
};
