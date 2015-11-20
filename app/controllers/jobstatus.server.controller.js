'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	JobStatus = mongoose.model('JobStatus'),
	_ = require('lodash');

/**
 * List of JobStatus
 */
exports.list = function(req, res) {
	JobStatus.find().exec(function(err, status) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(status);
		}
	});
};