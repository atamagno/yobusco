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
		required: 'Por favor ingrese un nombre',
		trim: true
	},
	description: {
		type: String,
		default: '',
		required: 'Por favor ingrese una descripci\u00f3n',
		trim: true
	}
});

mongoose.model('RatingType', RatingTypeSchema);