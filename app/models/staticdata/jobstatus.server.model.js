'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


module.exports = function(config){

	/**
	 * JobStatus Schema
	 */
	var JobStatusSchema = new Schema({
		name: {
			type: String,
			default: '',
			required: 'Por favor ingrese un nombre',
			trim: true
		},
		finished: {
			type: Boolean,
			default: false,
			required: true
		},
		default: {
			type: Boolean,
			default: false,
			required: true
		},
		points: {
			type: Number,
			default: 0
		},
		possible_next_statuses: [{
			type: Schema.ObjectId,
			ref: 'JobStatus'
		}],
		post_finished:{
			type: Boolean,
			default:null
		}
	});

	var JobStatus = mongoose.model('JobStatus', JobStatusSchema);
	JobStatus.find({}).populate('possible_next_statuses').lean().exec(function(err, jobStatuses) {
		config.staticdata.jobStatuses = jobStatuses;
	})

}

