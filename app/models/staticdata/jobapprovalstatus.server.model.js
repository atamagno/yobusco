'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	_ = require('lodash'),
	JobApprovalStatus,
	JobApprovalStatuses;


/**
 * JobApprovalStatus Schema
 */
var JobApprovalStatusSchema = new Schema({
	name: {
		type: String,
		required: 'Por favor ingrese un nombre',
		trim: true
	},
	description: {
		type: String,
		required: 'Por favor ingrese una descripcion',
		trim: true
	},
	keyword: {
		type: String,
		default: '',
		required: true
	}
});


module.exports = function(config){

	JobApprovalStatus = mongoose.model('JobApprovalStatus', JobApprovalStatusSchema);
	JobApprovalStatus.find({}).lean().exec(function(err, jobApprovalStatuses) {
		JobApprovalStatuses = jobApprovalStatuses;
		config.staticdata.jobApprovalStatuses = {};
		config.staticdata.jobApprovalStatuses.getAll = getAll;
		config.staticdata.jobApprovalStatuses.getByProperty = getByProperty;

	})
}

var getByProperty = function(propertyName, propertyValue)
{
	return _.find(JobApprovalStatuses,_.matchesProperty(propertyName,propertyValue));
}

var getAll = function(){

	return JobApprovalStatuses;
}


// Synchronizing local data after new/updated/removed items
JobApprovalStatusSchema.post('remove', function(){

	JobApprovalStatus.find({}).lean().exec(function(err, jobApprovalStatuses){
		JobApprovalStatuses = jobApprovalStatuses;
	});

});

JobApprovalStatusSchema.post('save', function(){

	JobApprovalStatus.find({}).lean().exec(function(err, jobApprovalStatuses){
		JobApprovalStatuses = jobApprovalStatuses;
	});

});




