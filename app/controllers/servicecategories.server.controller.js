'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	ServiceCategory = mongoose.model('ServiceCategory'),
	_ = require('lodash');

/**
 * Create a ServiceCategory
 */
exports.create = function(req, res) {
	var servicecategory = new ServiceCategory(req.body);

	servicecategory.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(servicecategory);
		}
	});
};

/**
 * Show the current ServiceCategory
 */
exports.read = function(req, res) {
	res.jsonp(req.servicecategory);
};

/**
 * Update a ServiceCategory
 */
exports.update = function(req, res) {
	var servicecategory = req.servicecategory ;

	servicecategory = _.extend(servicecategory , req.body);

	servicecategory.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(servicecategory);
		}
	});
};

/**
 * Delete an ServiceCategory
 */
exports.delete = function(req, res) {
	var servicecategory = req.servicecategory ;

	servicecategory.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(servicecategory);
		}
	});
};

/**
 * List of ServiceCategories
 */
exports.list = function(req, res) { 
	ServiceCategory.find().sort('-created').exec(function(err, servicecategories) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(servicecategories);
		}
	});
};

/**
 * ServiceCategory middleware
 */
exports.servicecategoryByID = function(req, res, next, id) {
	ServiceCategory.findById(id).exec(function(err, servicecategory) {
		if (err) return next(err);
		if (! servicecategory) return next(new Error('Failed to load ServiceCategory ' + id));
		req.servicecategory = servicecategory ;
		next();
	});
};
