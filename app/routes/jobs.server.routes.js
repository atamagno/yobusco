'use strict';

module.exports = function(app) {
	var jobs = require('../../app/controllers/jobs.server.controller');
	var jobstatus = require('../../app/controllers/jobstatus.server.controller');

	// Jobs Routes
	app.route('/jobs').post(jobs.create);

	// JobStatus Routes
	app.route('/jobstatus').get(jobstatus.list);
};
