'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var Ratings = new Schema({
	type: {
		type: Schema.ObjectId,
		ref: 'RatingType',
		required: 'Please select a rating type'
	},
	rate: {
		type: Number,
		min: 0,
		max: 5,
		default: 0,
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
		required: 'Please select a job'
	},
	services: {
		type: [Schema.ObjectId],
		ref: 'ServiceSubcategory',
		required: 'Please select a job'
	},
	comment: {
		type: String,
		default: '',
		trim: true
	},
	ratings: [Ratings],
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Review', ReviewSchema);
