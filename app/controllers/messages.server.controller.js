'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	mailer = require('./mailer.server.controller'),
	Message = mongoose.model('Message'),
	Conversation = mongoose.model('Conversation'),
	_ = require('lodash');

/**
 * Create a Message
 */
exports.create = function(req, res) {
	var message = new Message(req.body);

	var conversationId = req.body.conversationId;

	message.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			// Create a new conversation
			if (!conversationId) {

				var conversation = new Conversation();
				conversation.user1 = message.to;
				conversation.user2 = message.from;
				conversation.messages.push(message);

				conversation.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {

						Message.findOne(message)
							.populate('to')
							.populate('from').exec(function (err, message) {

								// TODO: send email to sender user?
								mailer.sendMail(res, 'new-message-email',
									{
										toName: message.to.displayName,
										fromName: message.from.displayName,
										message: message.content
									}, 'Nuevo mensaje', message.to.email);

								Conversation.findOne(conversation)
									.populate('user1', 'displayName')
									.populate('user2', 'displayName')
									.populate('messages').exec(function (err, conversation) {
										if (err) {
											return res.status(400).send({
												message: errorHandler.getErrorMessage(err)
											});
										} else {
											res.jsonp(conversation);
										}
									});
							});
					}
				});
			} else {
				Conversation.findById(conversationId).exec(function(err, conversation) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						conversation.messages.push(message);
						conversation.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {

								Message.findOne(message)
									.populate('to')
									.populate('from').exec(function (err, message) {

										// TODO: send email to sender user?
										mailer.sendMail(res, 'new-message-email',
											{
												toName: message.to.displayName,
												fromName: message.from.displayName,
												message: message.content
											}, 'Nuevo mensaje', message.to.email);

										Conversation.findOne(conversation)
											.populate('user1', 'displayName')
											.populate('user2', 'displayName')
											.populate('messages').exec(function (err, conversation) {
												if (err) {
													return res.status(400).send({
														message: errorHandler.getErrorMessage(err)
													});
												} else {
													res.jsonp(conversation);
												}
											});
									});
							}
						});
					}
				});
			}
		}
	});
};

/**
 * Show the current Message
 */
exports.read = function(req, res) {
	res.jsonp(req.conversation);
};

exports.update = function(req, res) {
	var conversation = req.conversation;

	conversation = _.extend(conversation , req.body);

	conversation.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(conversation);
		}
	});
};

exports.conversationByID = function(req, res, next, id) {
	Conversation.findById(id)
		.populate('user1', 'displayName')
		.populate('user2', 'displayName')
		.populate('messages').exec(function(err, conversation) {
		if (err) return next(err);
		if (!conversation) return next(new Error('Error al cargar conversación ' + id));

		currentUser = req.user;
		if (currentUser) {
			var unreadMessages = conversation.messages.filter(filterUnread);
			if (unreadMessages.length > 0) {
				unreadMessages.forEach(function(message) {
					message.read = true;
					message.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						}
					});
				});
			}
		}

		req.conversation = conversation;
		next();
	});
};

var currentUser;
function filterUnread(message) {
	return (message.to.equals(currentUser._id) && !message.read);
}

exports.listByUser = function(req, res) {

	var userId = req.params.userId;
	var messageCondition = req.params.condition;
	var currentPage = req.params.currentPage;
	var itemsPerPage = req.params.itemsPerPage;

	if (currentPage && itemsPerPage) {
		currentPage = parseInt(currentPage);
		itemsPerPage = parseInt(itemsPerPage);
		var startIndex = (currentPage - 1) * itemsPerPage;

		var paginationCondition = { skip: startIndex, limit: itemsPerPage };

		var searchCondition = {
			$or: [ {user1: userId}, {user2: userId} ],
			user1Archived: { $nin: [userId]},
			user2Archived: { $nin: [userId]}
		};

		if (messageCondition == 'archived') {
			searchCondition = {
			$and: [
				{ $or: [ {user1: userId}, {user2: userId} ] },
				{ $or: [ {user1Archived: userId}, {user2Archived: userId} ] }
			]};
		}

		var response = {};
		Conversation.count(searchCondition, function (err, count) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				response.totalItems = count;
				Conversation.find(searchCondition, {}, paginationCondition)
					.populate('user1', 'displayName')
					.populate('user2', 'displayName')
					.populate('messages')
					.exec(function (err, conversations) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						response.conversations = conversations;
						res.jsonp(response);
					}
				});
			}
		});
	}
};

exports.unreadByUser = function(req, res) {

	var userId = req.params.userId;

	var searchCondition = { to: userId, read: false };
	Message.count(searchCondition, function (err, count) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var reponse = { unreadCount: count };
			res.jsonp(reponse);
		}
	});
};
