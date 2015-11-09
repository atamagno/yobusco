'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * ServiceCategory Schema
 */
var ServiceCategorySchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill in a name',
		trim: true
	}
});

mongoose.model('ServiceCategory', ServiceCategorySchema);