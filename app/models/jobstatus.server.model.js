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
		required: 'Por favor ingrese un nombre',
		trim: true
	}
});

mongoose.model('JobStatus', JobStatusSchema);