'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	_ = require('lodash'),
	JobStatusReason,
	JobStatusReasons;


/**
 * JobStatusReason Schema
 */
var JobStatusReasonSchema = new Schema({
	keyword: {
		type: String,
		required: 'Por favor ingrese una palabra clave',
		trim: true
	},
	jobstatus: {
		type: Schema.ObjectId,
		ref: 'JobStatus'
	},
	description: {
		type: String,
		default: '',
		required: 'Por favor ingrese una descripci\u00f3n',
		trim: true
	},
	role: {
		type: String,
		enum: ['user', 'servicesupplier'],
		default: 'user'
	}
});

module.exports = function(config){

	JobStatusReason = mongoose.model('JobStatusReason', JobStatusReasonSchema);
	JobStatusReason.find({}).lean().exec(function(err, jobStatusReasons) {
		JobStatusReasons = jobStatusReasons;
		config.staticdata.jobStatusReasons = {};
		config.staticdata.jobStatusReasons.getAll = getAll;
		config.staticdata.jobStatusReasons.getByProperty = getByProperty;
		config.staticdata.jobStatusReasons.getMultipleByProperty = getMultipleByProperty;
	});

};

var getAll = function()
{
	return JobStatusReasons;
};

var getByProperty = function(propertyName, propertyValue)
{
	return _.find(JobStatusReasons,_.matchesProperty(propertyName,propertyValue));
};

var getMultipleByProperty = function(propertyName, propertyValue)
{
	return _.filter(JobStatusReasons,[propertyName, propertyValue]);
};



// Synchronizing local data after removed items
JobStatusReasonSchema.post('remove', function(){

	JobStatusReason.find({}).lean().exec(function(err, jobStatusReasons){
		JobStatusReasons = jobStatusReasons;
	});

});

// Synchronizing local data after saved (updated/new) items
JobStatusReasonSchema.post('save', function(){

	JobStatusReason.find({}).lean().exec(function(err, jobStatusReasons){
		JobStatusReasons = jobStatusReasons;
	});

});

// TODO: copy functions from jobstatus to support additional actions (e.g: from admin)