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
	ServiceCategory.find().exec(function(err, servicecategories) {
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
		if (! servicecategory) return next(new Error('Error al categor\u00eda de servicio ' + id));
		req.servicecategory = servicecategory ;
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
		ServiceCategory.count({}, function (err, count) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				response.totalItems = count;
				ServiceCategory.find({}, {}, { skip: startIndex, limit: itemsPerPage }, function(err, servicecategories) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						response.servicecategories = servicecategories;
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
