'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	ServiceSupplier = mongoose.model('ServiceSupplier'),
	Review = mongoose.model('Review'),
	_ = require('lodash');

exports.create = function(req, res) {
	var servicesupplier = new ServiceSupplier(req.body);
	servicesupplier.user = req.user;

	servicesupplier.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(servicesupplier);
		}
	});
};

exports.read = function(req, res) {
	res.jsonp(req.servicesupplier);
};

exports.update = function(req, res) {
	var servicesupplier = req.servicesupplier;

	servicesupplier = _.extend(servicesupplier, req.body);

	var comment = req.query.comment;
	if (comment) {

		var review = new Review();
		review.comment = comment;

		review.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				servicesupplier.reviews.push(review._id);
				servicesupplier.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {

						ServiceSupplier.findById(servicesupplier._id).populate('reviews').exec(function(err, servicesupplier) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								res.jsonp(servicesupplier);
							}
						});
					}
				});
			}
		});
	} else {
		servicesupplier.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(servicesupplier);
			}
		});
	}
};

exports.delete = function(req, res) {
	var servicesupplier = req.servicesupplier;

	servicesupplier.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(servicesupplier);
		}
	});
};

exports.list = function(req, res) {
	ServiceSupplier.find().sort('-created').populate('user', 'displayName').exec(function(err, servicesuppliers) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(servicesuppliers);
		}
	});
};

exports.servicesupplierByID = function(req, res, next, id) {
	ServiceSupplier.findById(id).populate('user', 'displayName').populate('reviews').exec(function(err, servicesupplier) {
		if (err) return next(err);
		if (!servicesupplier) return next(new Error('Failed to load service supplier ' + id));
		req.servicesupplier = servicesupplier ;
		next();
	});
};

exports.search = function(req, res) {
	res.json(req.servicesuppliers);
};

exports.servicesuppliersByKeyword = function(req, res, next, id) {
	ServiceSupplier.find({ name: { $regex: id, $options: 'i' } }).populate('user', 'displayName')
		.exec(function(err, servicesuppliers) {
			if (err) next(err);
			req.servicesuppliers = servicesuppliers;
			next();
		});
};

exports.hasAuthorization = function(req, res, next) {
	if (req.servicesupplier.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};