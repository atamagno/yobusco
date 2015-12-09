'use strict';

module.exports = function(app) {
	var ratingtypes = require('../../app/controllers/ratingtypes.server.controller'),
		users = require('../../app/controllers/users.server.controller');

	// RatingType admin routes
	app.route('/ratingtypes-admin')
		.get(ratingtypes.list)
		.post(users.requiresLogin, users.isAdmin, ratingtypes.create);

	app.route('/ratingtypes-admin/:ratingtypeId')
		.get(ratingtypes.read)
		.put(users.requiresLogin, users.isAdmin, ratingtypes.update)
		.delete(users.requiresLogin, users.isAdmin, ratingtypes.delete);

	app.param('ratingtypeId', ratingtypes.ratingtypeByID);

	app.route('/ratingtypes-admin/:currentPage/:itemsPerPage').get(ratingtypes.listByPage);

	// RatingType routes
	app.route('/ratingtypes').get(ratingtypes.list);
	app.route('/ratingtypes/:currentPage/:itemsPerPage').get(ratingtypes.listByPage);
};
