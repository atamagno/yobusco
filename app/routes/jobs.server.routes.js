'use strict';

module.exports = function(app) {
	var jobs = require('../../app/controllers/jobs.server.controller');

	// Jobs Routes
	app.route('/jobs').post(jobs.create);
	app.route('/jobs/:jobId').get(jobs.read);

	app.param('jobId', jobs.findJobByID);

	app.route('/jobs-by-user/:userId').get(jobs.search);
	app.param('userId', jobs.listByUser);
};
