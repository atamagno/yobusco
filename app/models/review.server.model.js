'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var Ratings = new Schema({
	type: {
		type: Schema.ObjectId,
		ref: 'RatingType',
		required: 'Por favor seleccione un tipo de rating'
	},
	rate: {
		type: Number,
		min: 0,
		max: 5,
		default: 3,
	}
});

var ReviewSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	job: {
		type: Schema.ObjectId,
		ref: 'Job',
	},
	service_supplier: {
		type: Schema.ObjectId,
		ref: 'ServiceSupplier',
		required: 'Por favor seleccione un prestador de servicios'
	},
	services: [{
		type: Schema.ObjectId,
		ref: 'ServiceSubcategory',
	}],
	comment: {
		type: String,
		default: '',
		trim: true,
		required: 'Por favor ingrese un comentario'
	},
	ratings: [Ratings],
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Review', ReviewSchema);
