'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Review = mongoose.model('Review'),
	Job = mongoose.model('Job'),
	ServiceSupplier = mongoose.model('ServiceSupplier'),
	_ = require('lodash');

/**
 * Create a Review
 */
exports.create = function(req, res) {
	var review = new Review(req.body);

	review.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			ServiceSupplier.findById(review.service_supplier).exec(function(err, servicesupplier) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					servicesupplier.reviews.push(review);
					servicesupplier.overall_rating++;
					servicesupplier.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {

							if (review.job) {
								Job.findById(review.job).exec(function(err, job) {
									if (err) {
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										job.reviews.push(review);
										job.save(function(err) {
											if (err) {
												return res.status(400).send({
													message: errorHandler.getErrorMessage(err)
												});
											} else {
												res.jsonp(review);
											}
										});
									}
								});
							} else {
								res.jsonp(review);
							}
						}
					});
				}
			});
		}
	});
};

/**
 * Show the current Review
 */
exports.read = function(req, res) {
	res.jsonp(req.review);
};

/**
 * Update a Review
 */
exports.update = function(req, res) {
	var review = req.review ;

	review = _.extend(review , req.body);

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

/**
 * Delete an Review
 */
exports.delete = function(req, res) {
	var review = req.review ;

	review.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(review);
		}
	});
};

/**
 * List of Reviews
 */
exports.list = function(req, res) {
	Review.find().exec(function(err, reviews) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reviews);
		}
	});
};

/**
 * Review middleware
 */
exports.reviewByID = function(req, res, next, id) {
	Review.findById(id).populate('user', 'displayName')
						.populate('job')
						.populate('service_supplier')
						.populate('ratings.type')
						.populate('services').exec(function(err, review) {

		if (err) return next(err);
		if (!review) return next(new Error('Failed to load Review ' + id));
		if (review.job) {
			Job.populate(review.job, {path: 'service_supplier', select: 'display_name'}, function(err, job){
				if (err) return next(err);
				if (!job) return next(new Error('Failed to load Job'));
				req.review = review;
				next();
			});
		} else {
			req.review = review;
			next();
		}

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
		Review.count({}, function (err, count) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				response.totalItems = count;
				Review.find({}, {}, { skip: startIndex, limit: itemsPerPage }, function(err, reviews) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						response.reviews = reviews;
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

exports.search = function(req, res) {
	res.json(req.reviews);
};

exports.listByServiceSupplier = function(req, res, next, serviceSupplierId) {

	Review.find({service_supplier: serviceSupplierId}).exec(function(err, reviews) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reviews);
		}
	});
};