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
		required: 'Por favor ingrese un nombre',
		trim: true
	}
});

mongoose.model('ServiceCategory', ServiceCategorySchema);