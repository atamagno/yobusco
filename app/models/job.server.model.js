'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	_ = require('lodash'),
	config = require('../../config/config');

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
		ref: 'ServiceSubcategory'
		// TODO: add custom validator to check that one or more services are required.
		// Can't the validator just be defined here just like other regular fields?
		// Check this: http://stackoverflow.com/questions/25965535/how-to-validate-in-mongoose-an-array-and-the-same-time-its-elements
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

/**
 Updates supplier job count, points and category
 considering the status of the review being added/updated.
 */
JobSchema.post('save',function(job){

	// TODO: split between completed , abandoned and in-progress job counts?
	// The way it is now, job count will only be updated if job status is completed... which is probably not correct...

	// TODO: add effectiveness attribute to supplier? (percentage of completed/guaranteed vs. abbandonned/not guaranteed?
	// Maybe a chart (pie?) that should not consider the in-progress jobs...
	if(job.status.finished){
		job.constructor.populate(job,[{path: 'service_supplier', select: 'display_name'},
									  {path: 'user'},
									  {path: 'status'}], function(err, job) {
			if(err){

				// TODO: add logging here stating that - service supplier associated to the job could not
				// be found. Would this be possible at all?
			}
			else{
				job.service_supplier.jobCount++;
				var jobStatusConfig =_.find(config.staticdata.jobStatuses, _.matchesProperty('_id', job.status._id));
				job.service_supplier.updatePoints(jobStatusConfig.points);
				job.service_supplier.save(function(err){
					if(err){
						// TODO: add logging here too....
					}

				})

			}
		});


	}

});

/** Pre save validation to verify if user is allowed to create a job for the specific supplier.
 *  Validation is also applied in case the Job exists, and it's being updated to an invalid status.
 *  (e.g.: multiple 'completed' / 'abandoned' statues to add/reduce points maliciously)
  */

JobSchema.pre('save', function(next){

	// TODO: make limit configurable?
	var recentJobLimitDate = new Date();
	recentJobLimitDate.setMonth(recentJobLimitDate.getMonth() - 1); // setting limit to a month ago..
	var jobBeingSaved = this;


		jobBeingSaved.constructor.findById(jobBeingSaved._id, function(err, currentJob){
		// If job submitted is an existing one
		if(currentJob)
		{
			// Getting config of current status
			var currentJobStatusConfig = _.find(config.staticdata.jobStatuses, _.matchesProperty('_id', currentJob.status));

			// When coming from updating the job (e.g.: just status/comment, etc), .status is a model (populated)
			// (it was retrieved by the update route, populating status, services, etc), but
			// when coming from a review, status is just an id. So resolving that here...
			// TODO: seems this is not working when status is not being updated (if below is considering them different)
			var jobBeingSavedStatusId = jobBeingSaved.populated('status') ? jobBeingSaved.status._id : jobBeingSaved.status;

			// If status is changing...we'll check if the change to the new status is allowed...
			if(jobBeingSavedStatusId != currentJob.status)
			{
				// Checking for if new status is allowed
				var next_status_found = _.find(currentJobStatusConfig.possible_next_statuses,_.matchesProperty('_id',jobBeingSavedStatusId));
				if(!next_status_found)
				{
					next(new Error('No es posible actualizar el trabajo al resultado seleccionado.'));
				}
				else{next();}
			}
			else
			{
				next();
			}


		}
		else // if not existing, search for other existing jobs from the same user, supplier, services,
		 	 // and recently created..
		{
				// TODO: find patterns on users loading multiple jobs for different services on the same supplier
				// and the close dates...astroturfing...
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
							next(new Error('No es posible agregar mas de un trabajo para el mismo proveedor' +
							' y los mismos servicios en el periodo de un mes.'));

						}
						else {
							next();
						}

					}

				});

		}

	})

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