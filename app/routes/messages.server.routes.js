'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var messages = require('../../app/controllers/messages.server.controller');

	// Messages Routes
	app.route('/messages').post(users.requiresLogin, messages.create);

	app.route('/messages/:conversationId')
		.get(users.requiresLogin, messages.read)
		.put(users.requiresLogin, messages.update);

	// Finish by binding the Message middleware
	app.param('conversationId', messages.conversationByID);

	app.route('/messages-by-user/:userId/:condition/:currentPage/:itemsPerPage').get(users.requiresLogin, messages.listByUser);
	app.route('/unread-messages-by-user/:userId').get(users.requiresLogin, messages.unreadByUser);
};
