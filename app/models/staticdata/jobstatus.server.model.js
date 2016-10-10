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
		default:false
	},
	initial:{
		type: Boolean,
		default:false
	},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'servicesupplier', 'admin']
		}]
	},
	requires_approval_by: {
		type: [{
			type: String,
			enum: ['user', 'servicesupplier', 'admin']
		}]
	}
});

module.exports = function(config){

	JobStatus = mongoose.model('JobStatus', JobStatusSchema);
	JobStatus.find({}).populate('possible_next_statuses').lean().exec(function(err, jobStatuses) {
		JobStatuses = jobStatuses;
		config.staticdata.jobStatuses = {};
		config.staticdata.jobStatuses.getAll = getAll;
		config.staticdata.jobStatuses.getByProperty = getByProperty;
		config.staticdata.jobStatuses.isNextPossible = isNextPossible;
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

var isNextPossible = function(currentStatus, nextStatus)
{
	if(currentStatus.equals(nextStatus)){
		return true;
	}
	else{
		// Getting config of current status
		var currentStatusConfig = getByProperty('_id', currentStatus);

		// Checking if next status is present in the list of possible next statuses for current one.
		var next_status_found = _.find(currentStatusConfig.possible_next_statuses, _.matchesProperty('_id', nextStatus));
		if (next_status_found){
			return true;
		}
		else{
			return false;
		}

	}
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