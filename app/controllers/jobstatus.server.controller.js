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
	/*JobStatus.find().exec(function(err, status) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(status);
		}
	});*/
	res.jsonp(config.staticdata.jobStatuses);
};

/**
 * JobStatus middleware
 */
exports.jobstatusByID = function(req, res, next, id) {

	/*JobStatus.findById(id).exec(function(err, jobstatus) {
		if (err) return next(err);
		if (!jobstatus) return next(new Error('Error al cargar estado de trabajo ' + id));
		req.jobstatus = jobstatus ;
		next();
	});*/
	req.jobstatus = _.find(config.staticdata.jobStatuses, function(jobStatus){

		return jobStatus._id == id;
	});
	next();

};

// TODO: adapt this function to use jobStatuses from config.staticdata.
// Do we really need pagination on jobStatuses?
exports.listByPage = function(req, res) {

	var currentPage = req.params.currentPage;
	var itemsPerPage = req.params.itemsPerPage;

	// TODO: add more validation to query string parameters here.
	if (currentPage && itemsPerPage) {
		currentPage = parseInt(currentPage);
		itemsPerPage = parseInt(itemsPerPage);
		var startIndex = (currentPage - 1) * itemsPerPage;

		var response = {};
		JobStatus.count({}, function (err, count) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				response.totalItems = count;
				JobStatus.find({}, {}, { skip: startIndex, limit: itemsPerPage }, function(err, jobstatus) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						response.jobstatus = jobstatus;
						res.jsonp(response);
					}
				});
			}
		});

	} else {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	}
};