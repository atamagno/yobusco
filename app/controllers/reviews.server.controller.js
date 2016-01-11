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

			// Moved the logic to update the review count and the overall rating fields
			// of the service supplier (associated to the review) from here, to the actual reviews model
			// so we make sure that whenever a review is saved on the model side, we also consider the associated
			// summary fields on the supplier.

			// TODO: do we really need review count associated to a job?
			// I'd expect only one review associated to a job
			// (created by the user that is submitting the review and selected the associated job....)
			if (review.job) {
				Job.findById(review.job).exec(function (err, job) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						job.reviewCount++;
						job.save(function (err) {
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

				Review.populate(review, {path: "user", select: "displayName"}, function(err, review){
						if(err){
						// TODO: add logging here stating that - user associated to the review could not
						// be found. Would this be possible at all?
						// TODO: Can we get the user on the client side to save this transaction?
						}

						res.jsonp(review.toJSON()); // this allows getting the virtual attributes of the document
						// (e.g.: the calculated ratingsAvg).
				})

			}

		}

	});
};

/**
 * Show the current Review
 */
exports.read = function(req, res) {
	res.jsonp(req.review);
};

// TODO: should we really be able to update/delete a review?
// Maybe just from the admin....make sure the permissions are being checked on the route...

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
			ServiceSupplier.findById(review.service_supplier).exec(function(err, servicesupplier) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {

					servicesupplier.reviewCount--;
					servicesupplier.overall_rating--;
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
										job.reviewCount--;
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
		if (!review) return next(new Error('Error al cargar comentario ' + id));
		if (review.job) {
			Job.populate(review.job, {path: 'service_supplier', select: 'display_name'}, function(err, job){
				if (err) return next(err);
				if (!job) return next(new Error('Error al cargar trabajo'));
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

// TODO: do we need to provide the average from the other functions/routes?
exports.listByServiceSupplier = function(req, res) {

	var serviceSupplierId = req.params.serviceSupplierId;
	Review.listByServiceSupplierWithAverage(serviceSupplierId, function(err, reviews){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else
		{
			res.jsonp(reviews);
		}

	});

};


exports.listByJob = function(req, res) {

	var jobId = req.params.jobId;
	Review.find({job: jobId}).exec(function(err, reviews) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reviews);
		}
	});
};