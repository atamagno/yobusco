'use strict';

module.exports = function(app) {
	// Root routing
	var core = require(__base + 'app/controllers/core.server.controller');
	app.route('/').get(core.index);
};