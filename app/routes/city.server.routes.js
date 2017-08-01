'use strict';

module.exports = function(app) {
	var cities  = require(__base + 'app/controllers/cities.server.controller');

	// City routes
	app.route('/cities').get(cities.list);
};
