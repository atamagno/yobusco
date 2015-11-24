'use strict';

module.exports = function(app) {
	var ratingtypes = require('../../app/controllers/ratingtypes.server.controller');

	// RatingType Routes
	app.route('/ratingtypes')
		.get(ratingtypes.list)
		.post(ratingtypes.create);

	app.route('/ratingtypes/:ratingtypeId')
		.get(ratingtypes.read)
		.put(ratingtypes.update)
		.delete(ratingtypes.delete);

	app.param('ratingtypeId', ratingtypes.ratingtypeByID);

	app.route('/ratingtypes/:currentPage/:itemsPerPage').get(ratingtypes.listByPage);
};
