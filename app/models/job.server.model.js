'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Job Schema
 */
var JobSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	name: {
		type: String,
		default: '',
		required: 'Please fill in a name',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	service_supplier: {
		type: Schema.ObjectId,
		ref: 'ServiceSupplier',
		required: 'Please select a service supplier'
	},
	status: {
		type: Schema.ObjectId,
		ref: 'JobStatus',
		required: 'Please select a status'
	},
	reviews:[{
		type: Schema.ObjectId,
		ref: 'Review',
	}],
	start_date: {
		type: Date,
		default: Date.now,
		required: 'Please fill in a start date',
	},
	expected_date: {
		type: Date,
		required: 'Please fill in a expected finish date',
	},
	finish_date: {
		type: Date
	}
});

mongoose.model('Job', JobSchema);