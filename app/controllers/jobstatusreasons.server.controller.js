'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	config = require(__base + 'config/config');


exports.list = function(req, res) {
	res.jsonp(config.staticdata.jobStatusReasons.getAll());
};

// TODO: copy functions from jobstatus to support additional actions (e.g: from admin)

