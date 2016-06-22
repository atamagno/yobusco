'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Review = mongoose.model('Review'),
	Job = mongoose.model('Job'),
	ServiceSupplier = mongoose.model('ServiceSupplier'),
	_ = require('lodash'),
	async = require('async');

/**
 * Create a Review either from:
 * - A job that is updated to a completed status
 * - Or from a newly created review (which also generates a job on the fly)
 * - Either the existing job being updated or the generated job on the fly is saved as well.
 */
exports.create = function(req, res) {

	var review = new Review(req.body);
	resolveJob(review, req.body.jobDetails, function(err, job) {

		if(err){
			// TODO: return error to client here...
		}
		else{
			async.series ({
					review: function(done){
						// TODO: it's possible that the review gets saved without the job being saved...
						// (e.g.: when adding a review without a job, and there are other jobs
						// for the same service/s recently loaded)

						review.job = job._id; // reassigning the job to the review
						// (in case it was generated on the fly, and it was not set from the client side)

						// Saving the review.
						review.save(function (err, review) {
							done(err,review);
						});
					},
					job: function(done){
						// Saving the job
						job.save(function(err, job){
							done(err,job);
						});
					}
				},
				function(err, results){
					if(err){
						// TODO: logging here to state that review could not be saved?
						// Probably return error to client as well....
					}
					else{
						// Returning either job or review object depending on path from the client.
						if(req.body.reviewPath == 'fromJob'){
							res.jsonp(results.job);
						}
						else
						{
							res.jsonp(results.review.toJSON());
						}
					}

			});

		}
	});

};


function resolveJob(review, jobDetails, cb)
{

	var job = new Job(jobDetails);
	// If job is selected for a review, update it, and add return reference to it.
	if(review.job){
			Job.findById(review.job, function(err, existingJob) {
			if(err)
			{
				// TODO: add logging stating that job could not be found from review...
				cb(err, null);
			}
			else{
				 	existingJob.finish_date = job.finish_date;
					existingJob.status = job.status;
					existingJob.description = job.description;
					existingJob.review = review._id;
					cb(null, existingJob);
			}
		});
	}
	else{   // otherwise, generate job on the fly and associate to review
			job.finish_date = job.start_date;
			job.expected_date = job.start_date;
			job.user = review.user;
			job.name = 'Trabajo';
			job.description = '.';
			job.service_supplier = review.service_supplier;
			job.status = jobDetails.status;
			job.services = jobDetails.services;
		   	job.review = review._id;
			cb(null, job);
	}

}

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