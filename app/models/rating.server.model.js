'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Rating Schema
 */
var RatingSchema = new Schema({
	type: {
		type: Schema.ObjectId,
		ref: 'RatingType',
		required: 'Por favor seleccione un tipo de rating.'
	},
	rate: {
		type: Number,
		min: [0, 'Por favor ingrese un valor de rating entre 0 y 5.'],
		max: [5, 'Por favor ingrese un valor de rating entre 0 y 5.'],
		default: 3
	}
}/*, {_id: false}*/);

module.exports = RatingSchema;

// TODO: need to add validator to make sure ratings array is populated here - similar to services on job????
// using RatingSchema.path('???') or needs to be applied on ReviewSchema???