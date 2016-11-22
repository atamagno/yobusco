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
	config = require('../../config/config'),
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
		function saveJob (done) {
			job.save(function(err, job) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(job);
					var jobCopy = new Job(job); // Copying job so as populate in the next function is not overridden by
												// job population performed in job post save hook
												// Note that in the functions below, we're only getting supplier and user
												// display name and email from this copy (so we ensure it's our populated
												// copied document), but for the rest of the items (e.g.: job.name,
												// job.approval, etc) we use the former doc since those attributes are
												// not changed by the job post save hook.
					return done(null, jobCopy);
				}
			});
		}, // TODO: maybe we should defer the emails to a dedicated job/queue manager?
		   // E.g.: see https://github.com/nodemailer/nodemailer (Deliverying Bulk email section
		   // E.g.: see https://ifelse.io/2016/02/23/using-node-redis-and-kue-for-priority-job-processing/
		   // And see: https://devcenter.heroku.com/articles/asynchronous-web-worker-model-using-rabbitmq-in-node
		   // And: https://www.quora.com/What-is-the-best-way-to-have-delayed-job-queue-with-node-js
		   // TODO: make a difference here on jobs created from a review?
		function getUserAndSupplierDataForEmail(jobCopy, done) {
			jobCopy.populate([{path: 'service_supplier', select: 'display_name email'},
						  {path: 'user', select: 'displayName email'}], function(err,jobCopy){

				if (err) {
					// TODO: logging here?
					return done(err);
				} else {
					return done(null, jobCopy);
				}

			});
		},
		function sendJobCreatedEmail(jobCopy) { // TODO: add done parameter and call it here + error handling for mailer.sendMail...
			var createdByUser = job.created_by.roles.indexOf('user') != -1;
			var recipientName = createdByUser ? jobCopy.service_supplier.display_name : jobCopy.user.displayName;
			var fromName = createdByUser ? jobCopy.user.displayName : jobCopy.service_supplier.display_name;
			var toEmail = createdByUser ? jobCopy.service_supplier.email : jobCopy.user.email;

			// TODO: remove the hashtag in urls by updating angular settings.
			// See: https://scotch.io/tutorials/pretty-urls-in-angularjs-removing-the-hashtag
			// TODO: if user is not logged in, we redirect to login page from angular.
			// That's ok, but we should probably redirect to the job once the user logs in...
			// TODO: add job details to email (e.g.: job nane, services, dates, etc?)
			// TODO: check if jobUrl as it is now, still works for other environments, (especially prod)...
			// If port is still returned from req.get('host'), we don't want to include it in the job url...
			// All these apply also for updated jobs email notification below...
			var jobUrl = req.protocol + '://' + req.get('host') +
						 '/#!/jobs/detail/' + job._id.toString();

			mailer.sendMail(res, 'new-job-email',
				{
					createdByUser: createdByUser,
					recipientName: recipientName,
					fromName: fromName,
					jobRequiresApproval: job.approval_required,
					jobUrl: jobUrl
				}, 'Nuevo trabajo', toEmail);
		}
	], function asyncFinalCallback(err) {
		if (err) { // TODO: does it make sense to send an error back here?
			       // Maybe if job was not saved, but not if email was not sent...maybe just logging in this case...
			       // Check if this function is really needed, since we're returning on save error already.
			       // Maybe restructure the code to use this function and handle the error...
			       // See this if last callback function is not really needed: https://github.com/caolan/async/issues/11
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


	job.action = getJobUpdateAction(jobDataSubmitted);
	switch (job.action){

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
			// TODO: is it better to do this (remove paths that cannot be updated from client) from route middleware?
			job = _.extend(job , removeProhibitedJobPaths(jobDataSubmitted));
			job.last_updated_by = req.user;
			break;

		default:
			return res.status(400).send({
				message: 'La actualización no puede completarse en base a la acción especificada.'
			});
	}

	async.waterfall([

		function saveJob(done){
			job.save(function(err, job) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(job);
					var jobCopy = new Job(job); // Copying job so as populate in the next function is not overridden by
									  			// job population performed in job post save hook
					 					        // Note that in the functions below, we're only getting supplier and user
											    // display name and email from this copy (so we ensure it's our populated
											    // copied document), but for the rest of the items (e.g.: job.name,
												// job.approval, etc) we use the former doc since those attributes are
											    // not changed by the job post save hook.
					return done(null, jobCopy);
				}
			});
		},
		function getUserAndSupplierDataForEmail(jobCopy, done){

			jobCopy.populate([{path: 'user', select: 'displayName email'},
				{path: 'service_supplier', select: 'display_name email'}], function(err, jobCopy) {
				if (err) {
					// TODO: logging here?
					return done(err);
				}
				else {
					return done(null,jobCopy);

				}
			});
		},
		function sendJobUpdatedEmail(jobCopy) { // TODO: add done parameter and call it here + error handling for mailer.sendMail...

			var actionTriggeredByUser, toEmail,
				emailTemplateName, emailTemplateInfo, emailSubject, bcc;
			switch (job.action) {
				// TODO: do we need to send an email notification when job approval is not required?
				case 'update':
					actionTriggeredByUser = job.last_updated_by.roles.indexOf('user') != -1;
					toEmail = actionTriggeredByUser ? jobCopy.service_supplier.email : jobCopy.user.email;
					emailTemplateInfo = {
						actionTriggeredByUser: actionTriggeredByUser,
						recipientName: actionTriggeredByUser ? jobCopy.service_supplier.display_name : jobCopy.user.displayName,
						fromName: actionTriggeredByUser ? jobCopy.user.displayName : jobCopy.service_supplier.display_name,
						jobName: job.name,
						jobRequiresApproval: job.approval_required
					};
					emailTemplateName = 'updated-job-email';
					emailSubject = 'Trabajo modificado';
					break;

				case 'approval':
					actionTriggeredByUser = job.approval_user.roles.indexOf('user') != -1;
					toEmail = actionTriggeredByUser ? jobCopy.service_supplier.email : jobCopy.user.email;
					emailTemplateInfo = {
						actionTriggeredByUser: actionTriggeredByUser,
						recipientName: actionTriggeredByUser ? jobCopy.service_supplier.display_name : jobCopy.user.displayName,
						fromName: actionTriggeredByUser ? jobCopy.user.displayName : jobCopy.service_supplier.display_name,
						jobName: job.name,
						jobApproved: job.approval,
						jobInitialApproval: !job.subsequent_approval_status
					};
					emailTemplateName = 'approved-job-email';
					emailSubject = job.approval ? 'Trabajo aprobado' : 'Trabajo rechazado';
					break;

				case 'resolution':
					emailTemplateInfo = {
						jobName : job.name
					}
					emailTemplateName = 'resolved-job-email';
					emailSubject = 'Resolucion de trabajo';
					bcc = jobCopy.service_supplier.email + ','  + jobCopy.user.email;
					break;
			}

			var jobUrl = req.protocol + '://' + req.get('host') +
						'/#!/jobs/detail/' + job._id.toString();
			emailTemplateInfo.jobUrl = jobUrl;
			mailer.sendMail(res, emailTemplateName, emailTemplateInfo,emailSubject,toEmail, bcc);

		}
	], function asyncFinalCallback(err){
		if(err){   // TODO: does it make sense to send an error back here?
				   // Maybe if job was not saved, but not if email was not sent...maybe just logging in this case...
				   // Check if this function is really needed, since we're returning on save error already.
				   // Maybe restructure the code to use this function and handle the error...
				   // See this if last callback function is not really needed: https://github.com/caolan/async/issues/11
			return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
		});

};

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
	// This populates the job details page and used from job model too (during job updates, approval & resolution).
	// Verify which data we need , and then use them in this populate statement.
	Job.findById(id).populate([{path: 'service_supplier', select: 'display_name user'},
		                       {path: 'user', select: 'displayName'},
							   {path: 'initial_approval_status'},
							   {path: 'subsequent_approval_status'},
								{path: 'status',
							     populate: {path: 'possible_next_statuses', select: 'keyword name finished post_finished'}},
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

	var status = req.params.status;
	var currentPage = req.params.currentPage;
	var itemsPerPage = req.params.itemsPerPage;

	if (currentPage && itemsPerPage) {
		currentPage = parseInt(currentPage);
		itemsPerPage = parseInt(itemsPerPage);
		var startIndex = (currentPage - 1) * itemsPerPage;

		var paginationCondition = { skip: startIndex, limit: itemsPerPage };
		var searchCondition = buildJobSearchQuery({status: status, user: req.user});

		if (req.user.roles.indexOf('servicesupplier') != - 1) {
			ServiceSupplier.findOne({user: req.user._id}).exec(function (err, servicesupplier) {
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
			searchCondition.user = req.user._id;
			findJobsByUserID(searchCondition, paginationCondition, req, res);
		}
	}
};

exports.listByServiceSupplier = function(req, res) {

	var serviceSupplierId = req.params.serviceSupplierId;
	var currentPage = req.params.currentPage;
	var itemsPerPage = req.params.itemsPerPage;

	if (currentPage && itemsPerPage) {
		currentPage = parseInt(currentPage);
		itemsPerPage = parseInt(itemsPerPage);
		var startIndex = (currentPage - 1) * itemsPerPage;

		var paginationCondition = { skip: startIndex, limit: itemsPerPage };
		var searchCondition = buildJobSearchQuery({status: 'approved'});
		searchCondition.service_supplier = serviceSupplierId;

		var response = {};
		Job.count(searchCondition, function (err, count) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				// TODO: this is used to show the list of jobs by supplier, so verify what is the
				// data that is really required and don't populate more than required.
				response.totalItems = count;
				Job.find(searchCondition,{}, paginationCondition)
					.populate([{path: 'target_status', select: 'name keyword'}, // TODO: is this one really needed?
						{path: 'user', select: 'displayName'},
						{path: 'status', select: 'name keyword'},
						{path: 'initial_approval_status', select: 'keyword'},
						{path: 'service_supplier', select: 'user'}, // TODO: is this one really needed?
						{path: 'last_updated_by', select: 'roles'}, // is this one really needed too?
						{path: 'services', select: 'name'}])
					.sort('-last_updated_date')
					.exec(function(err, jobs) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {

							//response.jobs = jobs.filter(filterNotApprovedJobsForUser.bind(null, req.user));
							response.jobs = jobs;
							res.jsonp(response);
						}
					});

			}
		});
	}

};

exports.listReviewsByServiceSupplier = function(req, res) {

	var serviceSupplierId = req.params.serviceSupplierId;
	var currentPage = req.params.currentPage;
	var itemsPerPage = req.params.itemsPerPage;

	if (currentPage && itemsPerPage) {
		currentPage = parseInt(currentPage);
		itemsPerPage = parseInt(itemsPerPage);
		var startIndex = (currentPage - 1) * itemsPerPage;

		var paginationCondition = { skip: startIndex, limit: itemsPerPage };
		// var searchCondition = buildJobSearchQuery({status: 'approved'});
		// searchCondition.review = { $exists: true, $ne: [] };
		var searchCondition = {review: {$exists: true, $ne: []}};
		searchCondition.service_supplier = serviceSupplierId;

		var response = {};
		Job.count(searchCondition, function (err, count) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				response.totalItems = count;
				Job.find(searchCondition,{}, paginationCondition)
					.populate([{path: 'user', select: 'displayName'}
							   /*,{path: 'services', select: 'name'}*/])
					.sort('-review.created')
					.exec(function(err, jobs) {
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

};



exports.canUpdate = function(req, res, next) {
	var job = req.job, user = req.user;
	if (!(job.user._id.equals(user._id)) && !(job.service_supplier.user.equals(user._id))
		&& (req.user.roles.indexOf('admin') == -1)) {
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

				// Checking service supplier is not creating a job for a different supplier...
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

	// TODO: maybe use req.user here? And remove userId from client and server routes?
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

	if(typeof jobDataSubmitted.action == 'undefined') { // user is resolving job challenge...
		return 'update'
	}
	else{
			 return jobDataSubmitted.action;
	}

}

function removeProhibitedJobPaths(jobDataSubmitted){

	for(var i=0;i<prohibitedJobPaths.length;i++)
	{
		_.unset(jobDataSubmitted, prohibitedJobPaths[i]);
		//TODO: maybe faster/better to use --> delete jobDataSubmitted[prohibitedPaths[i]] here?
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
						   {path: 'user', select: 'displayName'},
						   {path: 'services', select: 'name'},
						   {path: 'status'}])
				.sort('-last_updated_date')
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


/**
 * Creates a mongoose query object by calling different helper functions, depending on query parameter.
 *
 */
function buildJobSearchQuery(queryParams){

	var query = {};
	query.$and = [];

	// TODO: when in need to add new parameters, add them here, by calling additional functions similar to
	// buildJobSearchQueryByStatus
	if(queryParams.status){
		query = buildJobSearchQueryByStatus(queryParams, query);
	}

	// Removing $and property of query if no conditions have been added to it...
	if(query.$and.length == 0){
		delete query.$and;
	}
	return query;
}

function buildJobSearchQueryByStatus(queryParams, query){

	switch (queryParams.status)
	{
		case 'approved':
			var jobApprovedApprovalStatusId = config.staticdata.jobApprovalStatuses.getByProperty('keyword','approved')._id;
			query.initial_approval_status = jobApprovedApprovalStatusId;
			break;

		case 'finished':
			var finishedStatuses = [];
			finishedStatuses.push(config.staticdata.jobStatuses.getByProperty('keyword', 'finished')._id);
			finishedStatuses.push(config.staticdata.jobStatuses.getByProperty('keyword', 'guaranteed')._id);
			query.status = { $in: finishedStatuses};
			break;
		case 'incomplete':
			var incompleteStatuses = [];
			incompleteStatuses.push(config.staticdata.jobStatuses.getByProperty('keyword', 'incomplete')._id);
			incompleteStatuses.push(config.staticdata.jobStatuses.getByProperty('keyword', 'abandoned')._id)
			query.status = { $in: incompleteStatuses};
			break;
		case 'active':
			var jobInProgressStatusId = config.staticdata.jobStatuses.getByProperty('keyword', 'active')._id;
			query.status = jobInProgressStatusId;
			break;
		case 'pending-self':
			var jobPendingApprovalStatusId = config.staticdata.jobApprovalStatuses.getByProperty('keyword','pending')._id;
			query.$and.push({$or: 	[{initial_approval_status: jobPendingApprovalStatusId},
									 {subsequent_approval_status: jobPendingApprovalStatusId}]});
			query.last_updated_by = {$ne: queryParams.user._id};
			break;
		case 'pending-other':
			var jobPendingApprovalStatusId = config.staticdata.jobApprovalStatuses.getByProperty('keyword','pending')._id;
			query.$and.push({$or: 	[{initial_approval_status: jobPendingApprovalStatusId},
									 {subsequent_approval_status: jobPendingApprovalStatusId}]});
			query.last_updated_by = queryParams.user._id;
			break;
		case 'challenged':
			var jobChallengedApprovalStatusId = config.staticdata.jobApprovalStatuses.getByProperty('keyword','challenged')._id;
			query.$and.push({$or: [{initial_approval_status: jobChallengedApprovalStatusId},
									 {subsequent_approval_status: jobChallengedApprovalStatusId}]});
			break;
	}
	return query;
}