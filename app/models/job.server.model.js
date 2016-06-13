'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	_ = require('lodash'),
	config = require('../../config/config'),
	async = require('async');



/**
 * Job Schema
 */
var JobSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	name: {
		type: String,
		default: '',
		required: 'Por favor ingrese un nombre',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	service_supplier: {
		type: Schema.ObjectId,
		ref: 'ServiceSupplier',
		required: 'Por favor seleccione un prestador de servicios'
	},
	services: [{
		type: Schema.ObjectId,
		ref: 'ServiceSubcategory',
		required: true

	}],
	status: {
		type: Schema.ObjectId,
		ref: 'JobStatus',
		required: 'Por favor seleccione un estado de trabajo'
	},
	start_date: {
		type: Date,
		default: Date.now,
		required: 'Por favor ingrese una fecha de inicio'
	},
	expected_date: {
		type: Date,
		required: 'Por favor ingrese una fecha estimada'
	},
	finish_date: {
		type: Date
	},
	pictures: [{
		type: String,
		default: []
	}],
	review: {
	type: Schema.ObjectId,
		ref: 'Review'
	}
});


JobSchema.path('services').validate(function(services) {
	return services.length;
},"Por favor seleccione uno o mas servicios para el trabajo.");


/**
 Updates supplier job count, points and category
 considering the status of the job and values within the review (if being submitted).
 TODO: this can be refactored by using named functions for those actions in the async.waterfall
 */
JobSchema.post('save',function(job){

   // TODO: split between completed , abandoned and in-progress job counts?
   // TODO: add effectiveness attribute to supplier? (percentage of completed/guaranteed vs. abbandonned/not guaranteed?
   // Maybe a chart (pie?) that should not consider the in-progress jobs...

	// When coming from updating the job (e.g.: description/status/comment, etc), .status is a model
	// (populated from the query that retrieves the job)
	// But when job is generated/selected from a review/created, status is just an id. So resolving that here...
	// This should probably not be resolved by the model, but rather from outside.
	var jobBeingSavedStatusId = job.populated('status') ? job.status._id : job.status;
	var jobStatusConfig = _.find(config.staticdata.jobStatuses, _.matchesProperty('_id', jobBeingSavedStatusId));

		async.waterfall([

			// Populating target service supplier (points and jobCounts to manipulate them)
			// in order to update points based on job status afterwards, and job counts based on status.
			// This seems to be only required when job is being created...(new or from review)
			// When it's being updated, service_supplier is already populated from the query
			// that retrieves the job on the update controller.
			// Populating associated review as well, in order to update the suppliers points from it too.
			function(done){
				job.constructor.populate(job,[{path: 'service_supplier', select: 'points jobCounts'},
					{path: 'review'}], function(err, job) {
					if(err){
						return done(new Error('No se pudo recuperar el trabajo para actualizar los puntos del service supplier'));
					}
					else{
						return done(null,job)
					}
				});
			},

			// Updating service supplier points, from new job status and review.
			// NOTE: jobs cannot be updated (--> job name, description, services, etc) once set to a 'finished' status,
			// so it should not be possible to set the job to 'Completed' multiple times to add more points.
			// TODO: Should we check that here too for extra security? (e.g.: clients submitting REST requests directly..)
			// Updating service supplier job counts here too.
			// TODO: Update service supplier overall rating here too? Or just from the review post save?
			function(job, done) {

				// Updating service supplier points based on status points.
				if (jobStatusConfig.points) {
					job.service_supplier.updatePoints(jobStatusConfig.points * job.services.length);
				}
				// If status is being updated to a finished one (e.g.: 'Completed' / 'Abandoned')
				// a review is being submitted at the same time, so we should account for
				// the points associated to the review as well.
				if (jobStatusConfig.finished && job.review) {
						job.service_supplier.updatePoints(job.review.getReviewPoints());
				}

				job.service_supplier.updateJobCounts(job.previous_status, jobBeingSavedStatusId);

				job.service_supplier.save(function(err, job){
						done(err,job)
					});

			}
		],function(err){
			if(err){
				// TODO: add logging here stating that supplier points were not updated from job/review?
			}
		});


});

/** Pre save validation to verify if user is allowed to create a job for the specific supplier.
 *  Validation is also applied in case the Job exists, and it's being updated to an invalid status.
 *  (e.g.: multiple 'completed' / 'abandoned' statues to add/reduce points maliciously)
  */

JobSchema.pre('save', function(next){

	var jobBeingSaved = this;

		// If job submitted is an existing one
		if(!jobBeingSaved.isNew) {

			jobBeingSaved.constructor.findById(jobBeingSaved._id, function (err, currentJob) {

				// Getting config of current status
				var currentJobStatusConfig = _.find(config.staticdata.jobStatuses, _.matchesProperty('_id', currentJob.status));

				// TODO: is this really required on create?
				// Maybe we need to populate the status on resolveJob from reviews.server.controller?
				var jobBeingSavedStatusId = jobBeingSaved.populated('status') ? jobBeingSaved.status._id : jobBeingSaved.status;

				jobBeingSaved.previous_status =  currentJob.status;
				// If status is changing...we'll check if the change to the new status is allowed...
				if (jobBeingSavedStatusId.id != currentJob.status.id) {
					// Checking if new status is allowed
					var next_status_found = _.find(currentJobStatusConfig.possible_next_statuses, _.matchesProperty('_id', jobBeingSavedStatusId));
					if (!next_status_found) {
						next(new Error('No es posible actualizar el trabajo al resultado seleccionado.'));
					}
					else {
						next();
					}
				}
				else {
					next();
				}

			});
		}
		else // if it's a new one, then search for other existing jobs from the same user, supplier, services,
		 	 // and recently created..
		{

				// TODO: make limit configurable?
				var recentJobLimitDate = new Date();
				recentJobLimitDate.setMonth(recentJobLimitDate.getMonth() - 1); // setting limit to a month ago..

				// TODO: find patterns on users loading multiple jobs for different services on the same supplier
				// on close/similar dates...astroturfing...
				// Maybe check for IP address of the job being submitted?
				jobBeingSaved.constructor.find(
				{	user: jobBeingSaved.user.toString(),
					service_supplier: jobBeingSaved.service_supplier.toString(),
					services: {$in: jobBeingSaved.services},
					created: {$gte: recentJobLimitDate}
				}, function(err, jobs) {
					if(err) {
						// TODO: add logging here...
						next(new Error()) // throwing an error with empty message will return the default message...
					}
					else{
						if(jobs.length) {
							next(new Error('No es posible agregar trabajos ' +
							' para el mismo proveedor y los mismos servicios en el periodo de un mes.'));

						}
						else {
							next();
						}

					}

				});

		}

})


/** Get jobs with a status that can be used to add a review.
 *
 */

JobSchema.statics.getJobsForReview = function(serviceSupplierId, userId, callback){

	var Job = this;
	this.find({user: userId, service_supplier: serviceSupplierId})
			 .populate('services', 'name')
			 .populate('status').exec(
			  function(err, jobs){
				 if(err)
				 {
					 // TODO: add and return specific error logging here... / or maybe just return an empty array?
					 callback(err,null)

				 }
				 else
				 {
					 var jobsForReview = [];
					 if(jobs.length)
					 {
						 // Getting Id of completed status from static data
						 var completedJobStatusConfig = _.find(config.staticdata.jobStatuses, _.matchesProperty('name', 'Completed'));

						 // Checking if completed status Id is present on the list of possible next statuses for each job
						 for(var i = 0;i<jobs.length;i++)
						 {
							 var completedStatusPossible = _.find(jobs[i].status.possible_next_statuses,
								 						         _.matchesProperty('id', completedJobStatusConfig._id.id))
							 if(completedStatusPossible){
								 jobsForReview.push(jobs[i])
							 }
						 }
					 }
					 callback(null, jobsForReview)

				 }
		});

}

mongoose.model('Job', JobSchema);