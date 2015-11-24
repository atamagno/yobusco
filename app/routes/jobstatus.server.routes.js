'use strict';

module.exports = function(app) {
	var jobstatus = require('../../app/controllers/jobstatus.server.controller');

	// JobStatus Routes
	app.route('/jobstatus')
		.get(jobstatus.list)
		.post(jobstatus.create);

	app.route('/jobstatus/:jobstatusId')
		.get(jobstatus.read)
		.put(jobstatus.update)
		.delete(jobstatus.delete);

	app.param('jobstatusId', jobstatus.jobstatusByID);

	app.route('/jobstatus/:currentPage/:itemsPerPage').get(jobstatus.listByPage);
};
