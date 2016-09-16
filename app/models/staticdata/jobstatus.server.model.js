'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	_ = require('lodash'),
	JobStatus,
	JobStatuses;


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
	keyword: {
		type: String,
		default: ''
	},
	finished: {
		type: Boolean,
		default: false
	},
	default: {
		type: Boolean,
		default: false
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

module.exports = function(config){

	JobStatus = mongoose.model('JobStatus', JobStatusSchema);
	JobStatus.find({}).populate('possible_next_statuses').lean().exec(function(err, jobStatuses) {
		JobStatuses = jobStatuses;
		config.staticdata.jobStatuses = {};
		config.staticdata.jobStatuses.getAll = getAll;
		config.staticdata.jobStatuses.getByProperty = getByProperty;
	})

}
var getByProperty = function(propertyName, propertyValue)
{
	return _.find(JobStatuses,_.matchesProperty(propertyName,propertyValue));
}

var getAll = function()
{
	return JobStatuses;
}

// Synchronizing local data after new/updated/removed items
JobStatusSchema.post('remove', function(){

	JobStatus.find({}).populate('possible_next_statuses').lean().exec(function(err, jobStatuses){
		JobStatuses = jobStatuses;
	});

});

JobStatusSchema.post('save', function(){

	JobStatus.find({}).populate('possible_next_statuses').lean().exec(function(err, jobStatuses){
		JobStatuses = jobStatuses;
	});

});