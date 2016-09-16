'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	JobApprovalStatus = mongoose.model('JobApprovalStatus'),
	_ = require('lodash'),
	config = require('../../config/config');

/**
 * TODO: add create, delete and update for job approval statuses (copy from job statuses controller)
 */

/**
 * List of JobApprovalStatus
 */
exports.list = function(req, res) {
	res.jsonp(config.staticdata.jobApprovalStatuses.getAll());
};

