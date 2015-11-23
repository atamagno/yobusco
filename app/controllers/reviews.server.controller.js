'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Review = mongoose.model('Review'),
	_ = require('lodash');

/**
 * Create a Review
 */
exports.create = function(req, res) {
	var review = new Review(req.body);
	review.user = req.user;

	review.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(review);
		}
	});
};