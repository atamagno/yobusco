'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	RatingType = mongoose.model('RatingType'),
	_ = require('lodash');

/**
 * Create a RatingType
 */
exports.create = function(req, res) {
	var ratingtypes = new RatingType(req.body);

	ratingtypes.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ratingtypes);
		}
	});
};

/**
 * Show the current RatingType
 */
exports.read = function(req, res) {
	res.jsonp(req.ratingtype);
};

/**
 * Update a RatingType
 */
exports.update = function(req, res) {
	var ratingtype = req.ratingtype ;

	ratingtype = _.extend(ratingtype , req.body);

	ratingtype.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ratingtype);
		}
	});
};

/**
 * Delete an RatingType
 */
exports.delete = function(req, res) {
	var ratingtype = req.ratingtype ;

	ratingtype.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ratingtype);
		}
	});
};

/**
 * List of RatingTypes
 */
exports.list = function(req, res) {
	RatingType.find().exec(function(err, ratingtypes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ratingtypes);
		}
	});
};

/**
 * RatingType middleware
 */
exports.ratingtypeByID = function(req, res, next, id) {
	RatingType.findById(id).exec(function(err, ratingtype) {
		if (err) return next(err);
		if (!ratingtype) return next(new Error('Failed to load RatingType ' + id));
		req.ratingtype = ratingtype;
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
		RatingType.count({}, function (err, count) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				response.totalItems = count;
				RatingType.find({}, {}, { skip: startIndex, limit: itemsPerPage }, function(err, ratingtypes) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						response.ratingtypes = ratingtypes;
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