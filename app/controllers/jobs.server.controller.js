'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Job = mongoose.model('Job'),
	_ = require('lodash');

/**
 * Create a Job
 */
exports.create = function(req, res) {
	var job = new Job(req.body);
	job.user = req.user;

	job.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(job);
		}
	});
};

/**
 * Show the current Job
 */
exports.read = function(req, res) {
	res.jsonp(req.job);
};

/**
 * Job middleware
 */
exports.findJobByID = function(req, res, next, id) {
	Job.findById(id).populate('service_supplier', 'display_name').populate('status', 'name').exec(function(err, job) {
		if (err) return next(err);
		if (!job) return next(new Error('Failed to load Job ' + id));
		req.job = job ;
		next();
	});
};

exports.search = function(req, res) {
	res.json(req.jobs);
};

exports.listByUser = function(req, res, next, userId) {

	Job.find({user: userId}).populate('service_supplier', 'display_name')
							.populate('status', 'name').exec(function(err, jobs)
	{
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(jobs);
		}
	});
};