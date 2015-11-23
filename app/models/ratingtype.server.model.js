'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * RatingType Schema
 */
var RatingTypeSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill in a name',
		trim: true
	},
	description: {
		type: String,
		default: '',
		required: 'Please fill in a description',
		trim: true
	}
});

mongoose.model('RatingType', RatingTypeSchema);