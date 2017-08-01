'use strict';

module.exports = function(app) {
	var jobstatusreasons = require(__base + 'app/controllers/jobstatusreasons.server.controller');

	// JobStatusReason routes
	app.route('/jobstatusreasons').get(jobstatusreasons.list);
};

// TODO: copy functions from jobstatus to support additional actions (e.g: from admin)
