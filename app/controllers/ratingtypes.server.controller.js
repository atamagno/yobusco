'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	RatingType = mongoose.model('RatingType'),
	_ = require('lodash');

/**
 * List of RatingTypes
 */
exports.list = function(req, res) {
	RatingType.find().exec(function(err, ratingtype) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ratingtype);
		}
	});
};