'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Message Schema
 */
var MessageSchema = new Schema({
	content: {
		type: String,
		default: '',
		required: 'Please fill message content',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	from: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	to: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	read: {
		type: Boolean,
		default: false,
		required: true
	}
});

mongoose.model('Message', MessageSchema);

var ConversationSchema = new Schema({
	user1: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	user2: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	user1Archived: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	user2Archived: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	messages: [{
		type: Schema.ObjectId,
		ref: 'Message'
	}]
});

mongoose.model('Conversation', ConversationSchema);

