'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	mailer = require('./mailer.server.controller'),
	Job = mongoose.model('Job'),
	ServiceSupplier = mongoose.model('ServiceSupplier'),
	User = mongoose.model('User'),
	async = require('async'),
	_ = require('lodash'),
	prohibitedJobPaths = ['initial_approval_status'
						 ,'subsequent_approval_status', 'target_status',
						 'user', 'service_supplier', 'last_updated_date', 'last_updated_by'];

/**
 * Create a Job
 */
exports.create = function(req, res) {
	var job = new Job(req.body);

	job.created_by = req.user;
	job.last_updated_by = req.user;

	if(req.body.jobpath == 'fromReview'){
		job.setJobDefaultsForReview();
	}

	async.waterfall([
		function(done) {
			job.save(function(err, job) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					// TODO: seems the response is not sent here, but rather after this function
					// completes execution (same for update and reportJob functions).
					// Is there a way to end the express request-response cycle, sending a response back,
					// but continue executing other tasks on the server (e.g.: such as sending emails below, logging, etc).
					// Or we need to fork a different process to isolate the tasks after res.jsonp so the
					// response is returned faster?
					res.jsonp(job);
					done(err, job);
				}
			});
		},
		function(job, done) {
			ServiceSupplier.findById(job.service_supplier).exec(function(err, servicesupplier) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					done(err, job, servicesupplier);
				}
			});
		},
		function(job, servicesupplier, done) {
			if (!job.createdByUser) {
				User.findById(job.user).exec(function (err, user) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						done(err, job, servicesupplier, user);
					}
				});
			} else {
				done(null, job, servicesupplier, null);
			}
		},
		function(job, servicesupplier, user) {
			if (job.createdByUser) {
				mailer.sendMail(res, 'new-job-for-service-supplier-email',
					{
						serviceSupplier: servicesupplier.display_name,
						userName: job.created_by.displayName
					}, 'Nuevo trabajo', servicesupplier.email);
				mailer.sendMail(res, 'new-job-by-user-email',
					{
						serviceSupplier: servicesupplier.display_name,
						userName: job.created_by.displayName
					}, 'Nuevo trabajo', job.created_by.email);
			} else {
				if (user) {
					mailer.sendMail(res, 'new-job-for-user-email',
						{
							serviceSupplier: servicesupplier.display_name,
							userName: user.displayName
						}, 'Nuevo trabajo', user.email);
					mailer.sendMail(res, 'new-job-by-service-supplier-email',
						{
							serviceSupplier: servicesupplier.display_name,
							userName: user.displayName
						}, 'Nuevo trabajo', servicesupplier.email);
				}
			}
		}
	], function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
	});
	
};

/**
 * Show the current Job
 */
exports.read = function(req, res) {
	res.jsonp(req.job.toJSON());
};

/**
 * Update a Job
 */
exports.update = function(req, res) {

	var job = req.job;
	var jobDataSubmitted = req.body;


	job.update_action = getJobUpdateAction(jobDataSubmitted);
	switch (job.update_action){

		case 'approval':
			job.approval = jobDataSubmitted.approval;
			job.approval_challenge_details = jobDataSubmitted.approval_challenge_details;
			job.approval_review = jobDataSubmitted.approval_review;
			job.approval_user = req.user;
			break;

		case 'resolution':
			job.resolution = jobDataSubmitted.resolution;
			job.resolution_user = req.user;
			break;

		case 'update':
			job = _.extend(job , removeProhibitedJobPaths(jobDataSubmitted)); // TODO: is it better to do this from route middleware?
			job.last_updated_by = req.user;
			break;

		default:
			return res.status(400).send({
				message: 'La actualización no puede completarse en base a la acción especificada.'
			});
	}

	job.save(function(err, job) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			res.jsonp(job);
			var user = req.user;
			Job.findOne(job)
				.populate('service_supplier user')
				.exec(function (err, job) {

					mailer.sendMail(res, 'updated-job-for-user-updating-email',
						{
							userName: user.displayName,
							jobName: job.name
						}, 'Trabajo modificado', user.email);

					var mailOptions = { jobName: job.name };
					if (user.email == job.user.email) {
						mailOptions = {
							userName: job.service_supplier.display_name,
							userUpdating: job.user.displayName
						};

						var emailTo = job.service_supplier.email;
					} else {
						mailOptions = {
							userName: job.user.displayName,
							userUpdating: job.service_supplier.display_name
						};

						var emailTo = job.user.email;
					}

					mailer.sendMail(res, 'updated-job-for-user-not-updating-email', mailOptions, 'Trabajo modificado', emailTo);


				});
		}
	});

	
};

/*function reportJob(req, res) {
	var job = req.job;

	job.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			res.jsonp(job);
			var user = req.user;
			Job.findOne(job)
				.populate('service_supplier user')
				.exec(function (err, job) {

					var mailOptions = { userName: user.displayName, jobName: job.name };
					var emailTo = user.email;

					// Send email to user who reported the job.
					mailer.sendMail(res, 'job-reported-for-user-reporting-email', mailOptions, 'Trabajo reportado', emailTo);

					// TODO: query for admin email, remove hardcoded email.
					emailTo = 'yo.busco.test@gmail.com';

					// Send email to admin.
					mailer.sendMail(res, 'job-reported-for-admin-email', mailOptions, 'Trabajo reportado', emailTo);

					if (user.email == job.user.email) {
						mailOptions.userName =  job.service_supplier.display_name;
						emailTo = job.service_supplier.email;
					} else {
						mailOptions.userName = job.user.displayName;
						emailTo = job.user.email;
					}

					// Send email to reported user.
					mailer.sendMail(res, 'job-reported-for-reported-user-email', mailOptions, 'Trabajo reportado', emailTo);


				});
		}
	});
};*/



/**
 * Delete an Job
 */
// TODO: we shouldn't delete jobs, right?
exports.delete = function(req, res) {
	var job = req.job ;

	job.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			ServiceSupplier.findById(job.service_supplier).exec(function(err, servicesupplier) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					servicesupplier.jobCount--;
					servicesupplier.overall_rating--;
					servicesupplier.save(function (err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							res.jsonp(job);
						}
					});
				}
			});
		}
	});
};

/**
 * List of Jobs
 */
exports.list = function(req, res) {
	Job.find().exec(function(err, jobs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(jobs);
		}
	});
};

/**
 * Job middleware
 */
exports.findJobByID = function(req, res, next, id) {

	// TODO: need to populate less data here...(e.g.: we're populating user password hash, salt, roles, etc)
	// This populates the job details page. Verify which data we display and need on that page, and
	// then use them in this populate statement.
	Job.findById(id).populate([{path: 'service_supplier', select: 'display_name user'},
		                       {path: 'user', select: 'displayName'},
							   {path: 'initial_approval_status'},
							   {path: 'subsequent_approval_status'},
								{path: 'status',
							     populate: {path: 'possible_next_statuses', select: 'keyword name finished'}},
							   {path: 'target_status', select: 'name keyword finished'},
							   {path: 'review'},
							   {path: 'services', select: 'name'},
							   {path: 'approval_challenge_details.status', select: 'name'},
							   {path: 'last_updated_by', select: 'roles'}])

					.exec(function(err, job) {
						if (err) return next(err); // TODO: check here if job is not found, it seems there's no 'next'
									   // handler capturing the error and this is breaking...
						if (!job) return next(new Error('Error al cargar trabajo ' + id));
							req.job = job ;
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
		Job.count({}, function (err, count) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {

				response.totalItems = count;
				Job.find({}, {}, { skip: startIndex, limit: itemsPerPage }, function(err, jobs) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						response.jobs = jobs;
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

exports.listByUser = function(req, res) {

	var jobUserId = req.params.jobUserId;
	var isServiceSupplier = req.params.isServiceSupplier;
	var status = req.params.status;
	var currentPage = req.params.currentPage;
	var itemsPerPage = req.params.itemsPerPage;

	if (currentPage && itemsPerPage) {
		currentPage = parseInt(currentPage);
		itemsPerPage = parseInt(itemsPerPage);
		var startIndex = (currentPage - 1) * itemsPerPage;

		var paginationCondition = { skip: startIndex, limit: itemsPerPage };

		// TODO: change this logic and add a query the status IDs. Remove harcoded IDs.
		var searchCondition = {};
		switch (status)
		{
			case 'finished':
				searchCondition = { status: { $in: ['56264483477f11b0b2a6dd88','56263383477f11b0b2a6dd88']} };
				break;
			case 'active':
				searchCondition = { status: { $in: ['56269183477f11b662a6dd88']} };
				break;
			case 'pending':
				searchCondition = { status: { $in: ['56263383477f128bb2a6dd88']} };
				break;
		}

		if (isServiceSupplier === 'true') {
			ServiceSupplier.findOne({user: jobUserId}).exec(function (err, servicesupplier) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					searchCondition.service_supplier = servicesupplier._id;
					findJobsByUserID(searchCondition, paginationCondition, req, res);
				}
			});
		}
		else {
			searchCondition.user = jobUserId;
			findJobsByUserID(searchCondition, paginationCondition, req, res);
		}
	}
};

exports.listByServiceSupplier = function(req, res) {

	var serviceSupplierId = req.params.serviceSupplierId;

	Job.find({service_supplier: serviceSupplierId})
			  .populate([{path: 'target_status', select: 'name keyword'},
						 {path: 'user', select: 'displayName'},
						 {path: 'status'},
						 {path: 'initial_approval_status'},
						 {path: 'service_supplier', select: 'user'},
						 {path: 'last_updated_by', select: 'roles'}])
			  .exec(function(err, jobs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			res.jsonp(jobs.filter(filterNotApprovedJobsForUser.bind(null, req.user)));
		}
	});
};

exports.canUpdate = function(req, res, next) {
	var job = req.job, user = req.user;
	if (!(job.user._id.equals(user._id)) && !(job.service_supplier.user.equals(user._id))) {
		return res.status(401).send({
			message: 'El usuario no est\u00e1 autorizado'
		});
	}

	next();
};

/**
 * Checks several conditions that need to be met for job creation.
 * - User and supplier should exist.
 * - User and supplier should create a job only for themselves (not for a different user/supplier).
 * - Services included in the job should be serviced by the service supplier.
 */
exports.canCreate = function(req, res, next) {

	var user = req.user;
	var job = req.body;
	var error;

	async.parallel([
		function(done){
			User.findOne({'_id': job.user, roles: 'user'}).exec(function(err, foundUser){
				if(err) return done(new Error());

				// Checking that user exists.
				if(!foundUser) {
					return done(new Error('El usuario no existe'));
				}
				// Checking user is not creating a job for a different user...
				if(user.roles.indexOf('user') != -1 && user._id.toString() != job.user){
					error = new Error('El usuario no est\u00e1 autorizado');
					error.code = 401;
					return done(error);
				}
				done();

			});

		},
		function(done){

			ServiceSupplier.findById(job.service_supplier).exec(function(err, servicesupplier){
				if(err)	return done(new Error());

				// Checking that service supplier exists...
				if(!servicesupplier) {
					return done(new Error('El prestador de servicios no existe'));
				}

				// Checking service supplier is not creating a job for a supplier...
				if(user.roles.indexOf('servicesupplier') != -1 && !user.equals(servicesupplier.user)){
							error = new Error('El usuario no est\u00e1 autorizado');
							error.code = 401;
							return done(error);
				}

				// Checking that services submitted are offered by service supplier
				for(var i=0;i<job.services.length;i++){
					if(!mongoose.Types.ObjectId.isValid(job.services[i]) ||
					   !_.find(servicesupplier.services, mongoose.Types.ObjectId(job.services[i]))){
						return done(new Error('Uno o mas servicios seleccionados ' +
						'no son validos para el prestador de servicios'));
					}
				}
				done();
			});


		}
	], function(err){
		if(err){
			err.code = err.code || 400;
			return res.status(err.code).send({message: errorHandler.getErrorMessage(err, true)});
		}
		next();
	});

};

exports.listForReview = function(req, res) {
	Job.getJobsForReview(req.params.serviceSupplierId, req.params.userId, function(err, jobs) {
		if (err) {
			// TODO: add logging here...?
			res.jsonp([]);
		}
		else {
			res.jsonp(jobs);
		}
	});
}

function getJobUpdateAction(jobDataSubmitted){

	if(typeof jobDataSubmitted.update_action == 'undefined') { // user is resolving job challenge...
		return 'update'
	}
	else{
			 return jobDataSubmitted.update_action;
	}

}


function removeProhibitedJobPaths(jobDataSubmitted){

	for(var i=0;i<prohibitedJobPaths.length;i++)
	{
		_.unset(jobDataSubmitted, prohibitedJobPaths[i]);
	}

	return jobDataSubmitted;
}

function findJobsByUserID(searchCondition, paginationCondition, req, res) {

	var response = {};
	Job.count(searchCondition, function (err, count) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			response.totalItems = count;
			Job.find(searchCondition, {}, paginationCondition)
				.populate([{path: 'service_supplier', select: 'display_name'},
					{path: 'status'}])
				.exec(function (err, jobs) {

					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						response.jobs = jobs;
						res.jsonp(response);
					}
				});
		}
	});
}

function filterNotApprovedJobsForUser(user, job){

	// If the job has not been initially approved, non logged users and users other than
	// the job user and job supplier won't see the job.
	// NOTE: both user (function parameter) and job.user are populated, so we have to compare their Ids
	// job.service_supplier.user is not populated (it's an ObjectId itself), so we don't need its ._id)
	if(( !user || (!user._id.equals(job.user._id) && !user._id.equals(job.service_supplier.user)))
		&& job.initial_approval_status.keyword != 'approved'){
		return false;
	}
	return true;

}
