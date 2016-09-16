'use strict';

module.exports = function(app) {
	var jobapprovalstatus = require('../../app/controllers/jobapprovalstatus.server.controller');
		//users = require('../../app/controllers/users.server.controller');

	/* JobStatus admin routes TODO: add this routes and controllers for admin...
	app.route('/jobstatus-admin')
		.get(jobstatus.list)
		.post(users.requiresLogin, users.isAdmin, jobstatus.create);

	app.route('/jobstatus-admin/:jobstatusId')
		.get(jobstatus.read)
		.put(users.requiresLogin, users.isAdmin, jobstatus.update)
		.delete(users.requiresLogin, users.isAdmin, jobstatus.delete);

	app.param('jobstatusId', jobstatus.jobstatusByID);

	app.route('/jobstatus-admin/:currentPage/:itemsPerPage').get(jobstatus.listByPage);*/

	// JobStatus routes
	app.route('/jobapprovalstatus').get(jobapprovalstatus.list);
	// app.route('/jobstatus/:currentPage/:itemsPerPage').get(jobstatus.listByPage);
};