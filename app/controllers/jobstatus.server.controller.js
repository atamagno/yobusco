'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	JobStatus = mongoose.model('JobStatus'),
	_ = require('lodash'),
	config = require('../../config/config');

/**
 * Create a JobStatus
 */

// TODO: need to refresh the collection under config.staticdata.jobStatuses
// on create, update and delete?? Otherwise a restart of the app will be required.
exports.create = function(req, res) {
	var jobstatus = new JobStatus(req.body);

	jobstatus.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(jobstatus);
		}
	});
};

/**
 * Show the current JobStatus
 */
exports.read = function(req, res) {
	res.jsonp(req.jobstatus);
};

/**
 * Update a JobStatus
 */
exports.update = function(req, res) {
	var jobstatus = req.jobstatus ;

	jobstatus = _.extend(jobstatus , req.body);

	jobstatus.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(jobstatus);
		}
	});
};

/**
 * Delete an JobStatus
 */
exports.delete = function(req, res) {
	var jobstatus = req.jobstatus ;

	jobstatus.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(jobstatus);
		}
	});
};

/**
 * List of JobStatus
 */
exports.list = function(req, res) {
	res.jsonp(config.staticdata.jobStatuses.getAll());
};

/**
 * JobStatus middleware
 */
exports.jobstatusByID = function(req, res, next, id) {


	JobStatus.findById(id).exec(function(err, jobstatus) {
		if (err) return next(err);
	 	if (!jobstatus) return next(new Error('Error al cargar estado de trabajo ' + id));
	 	req.jobstatus = jobstatus ;
	 	next();
	 });
};

exports.listByPage = function(req, res) {

	var currentPage = req.params.currentPage;
	var itemsPerPage = req.params.itemsPerPage;

	// TODO: add more validation to query string parameters here.
	if (currentPage && itemsPerPage) {
		currentPage = parseInt(currentPage);
		itemsPerPage = parseInt(itemsPerPage);
		var startIndex = (currentPage - 1) * itemsPerPage;

		var response = {};
		var jobStatuses = config.staticdata.jobStatuses.getAll();
		response.totalItems = jobStatuses.length;

		if(startIndex + itemsPerPage >= response.totalItems){
			itemsPerPage = response.totalItems;
		}
		response.jobstatus = jobStatuses.slice(startIndex,itemsPerPage);
		res.jsonp(response);


	} else {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	}
};