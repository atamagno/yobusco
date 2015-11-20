'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * JobStatus Schema
 */
var JobStatusSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill in a name',
		trim: true
	}
});

mongoose.model('JobStatus', JobStatusSchema);