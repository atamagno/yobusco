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
	service_supplier_id: {
		type: Schema.Types.ObjectId,
		trim: true,
		required: 'Please select a service supplier'
	},
	job_status_id: {
		type: Schema.Types.ObjectId,
		trim: true,
		required: 'Please select a status'
	},
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