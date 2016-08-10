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
 ******************** Start Reviews related section
*/

var Rating = new Schema({
	type: {
		type: Schema.ObjectId,
		ref: 'RatingType',
		required: 'Por favor seleccione un tipo de rating'
	},
	rate: {
		type: Number,
		min: 0,
		max: 5,
		default: 3
	}
});

var ReviewSchema = new Schema({
	comment: {
		type: String,
		default: '',
		trim: true,
		required: 'Por favor ingrese un comentario'
	},
	ratings: [Rating],
	created: {
		type: Date,
		default: Date.now
	},
	recommend: {
		type: Boolean,
		default: null
	}
});

/** This allows the ratingsAvg virtual attribute (below) to be added to Job reviews
 *  when using the ToJSON function.
 */
ReviewSchema.set('toJSON', {virtuals: true});

/**
 Virtual to calculate the review ratings average.
 This will be returned when using the doc.toJSON method
 */
ReviewSchema.virtual('ratingsAvg').get(function(){

	return parseFloat(this.getRatingsAvg());

});

ReviewSchema.methods.getRatingsAvg = function()
{
	var ratingsTotal = 0;
	this.ratings.forEach(function(rating){
		ratingsTotal += rating.rate;
	})
	return (ratingsTotal / this.ratings.length).toFixed(2);

}

ReviewSchema.methods.getPointsFromRatingsAvg = function()
{
	var ratingsAvg = this.getRatingsAvg();
	return _.find(config.staticdata.reviewRatingsAvgPointsRanges,function(reviewRatingsAvgPointsRange){
		return reviewRatingsAvgPointsRange.min <= ratingsAvg && ratingsAvg  <= reviewRatingsAvgPointsRange.max

	}).points;

}

ReviewSchema.methods.getPointsFromRecommend = function()
{
	var points = 0;
	if(this.recommend != null)
	{
		var recommendPoints =  _.find(config.staticdata.userSupplierActionPoints, _.matchesProperty('action_name','recommend'));
		points = this.recommend ? recommendPoints.points.yes : recommendPoints.points.no;
	}
	return points;
}

ReviewSchema.methods.getPoints = function()
{
	var reviewPointsFromRatingsAvg = this.getPointsFromRatingsAvg();
	var reviewPointsFromRecommend = this.getPointsFromRecommend();
	return  parseFloat((reviewPointsFromRatingsAvg + reviewPointsFromRecommend).toFixed(2));


}

mongoose.model('Review', ReviewSchema);

/**
 ******************** End Reviews related section
 */



/**
 * Start Jobs related section
 * Testing JobPoints schema (in case needed)

var JobPointsSchema = new Schema({
	points: {
		type: Number,
		default: 0
	},
	status: {
		type: Schema.ObjectId,
		ref: 'JobStatus'
	}
},  {_id: false});
*/

var JobSchema = new Schema({
	createdBy: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	createdByUser: {
		type: Boolean,
		default: true
	},
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
	created_date: {
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
	reported: {
		type: Boolean,
		default: false
	},
	review: [ReviewSchema] // NOTE: mongoose 3.8.0 is not accepting a single document schema (: ReviewSchema) embedded,
						   // so using an array for now (even while each job will contain one single review)
						   // When upgrading to 4.x versions of mongoose, getting a memory leak issue
	                       // TODO: review this so upgrade can be done and single review is used like:
						   // review: ReviewSchema
						   // After the upgrade, the function getServiceSupplierRatingsAverage
	                       // can just use "$unwind": "$review.ratings",
						   // instead of "$unwind": "$review" and "$unwind" : "$review.ratings".
						   // More changes will be required on client side to not use array any more.
						   // and also under post save hook + init functions.

	// points: [JobPointsSchema]
});


JobSchema.path('services').validate(function(services) {
	return services.length;
},"Por favor seleccione uno o mas servicios para el trabajo.");


JobSchema.methods.setJobDefaultsForReview = function(){

	this.name = 'Trabajo';
	this.description = '.';
	this.finish_date = this.start_date;
	this.expected_date = this.start_date;

}

JobSchema.post('init', function(job){
	// Storing current status value and review in new paths/properties,
	// to be checked by pre and post save hooks.
	job.previous_status = job.status._id ? job.status._id : job.status;
	job.review_already_existed = job.review[0] ? true : false;
});

/**
 Updates supplier job count, points, category and overall rating
 considering the status of the job and values within the review (if being submitted).
 TODO: this can be refactored by using named functions for those actions in the async.waterfall
 */
JobSchema.post('save',function(job){

	// TODO: Add effectiveness attribute to supplier?
	// (percentage of completed/guaranteed vs. all other statuses (in exception of in progress/paused)
	// Maybe a chart (pie?)..

	async.waterfall([

		function(done){

			// NOTE: Population of points and job_counts is only required when job is new.
			// If being updated, it seems service supplier is already a model (populated from the query
			// under job update controller). Maybe use job.wasNew that is set from pre save hook below to differentiate?
			job.populate({path: 'service_supplier', select: 'points job_counts overall_rating'},
				function(err, job) {
					if (err) {
						// TODO: add logging here stating that supplier could not be updated?}
						// or at the bottom?
						return done(err);
					}
					else {
						return done(null, job);
					}
				});
		},
		function(job, done){

			// TODO: Consider changing this logic once we implement job approval status.
			// Points from job status and job counts should be calculated only when job approval
			// changes to 'approved'. We should probably compare previous approval status
			// with new one, and if new one is 'approved', then update job counts and job points.

			// We should probably also use a temporary status field within job (e.g.: target_status)
			// in order to store the status that we'll change to (selected by the user) and keep
			// the status value unchanged, until approved (update status and clear target_status).
			// This las part will need to be done from pre save hook.

			// NOTE: job.previous_status is set from schema post init hook (function above)
			job.service_supplier.updateJobCounts(job.previous_status, job.status);


			var job_status_config = _.find(config.staticdata.jobStatuses, _.matchesProperty('_id', job.status));
			if(job.wasNew)
			{
				job.service_supplier.updatePoints(job_status_config.points * job.services.length);
			}
			else {
				if (job.status.id != job.previous_status.id) {
					job.service_supplier.updatePoints(job_status_config.points * job.services.length);
				}
			}

			// NOTE: points for review probably won't require to check for job approval status
			// since it's a decision of the user that won't need supplier approval.
			if(job_status_config.finished && !job.review_already_existed && job.review[0]){
				job.service_supplier.updatePoints(job.review[0].getPoints());
				job.constructor.getServiceSupplierRatingsAverage(job.service_supplier._id, function(err, ratingsAvg) {
					if (err) {
						return done(err);
						// TODO: add logging here or at the bottom?
					}
					else {
						job.service_supplier.overall_rating = ratingsAvg.toFixed(2);
						return done(null, job.service_supplier);
					}
				});

			}
			else{return done(null, job.service_supplier)}

		},
		function(serviceSupplier, done){
			if(serviceSupplier.isModified())
				serviceSupplier.save(function(err, serviceSupplier){
					return done(err, serviceSupplier)
				});

		}], function(err){
		if(err){
			// TODO: add logging here?
		}
	});


});

/** Pre save validation to verify if user is allowed to create a job for the specific supplier.
 *  Validation is also applied in case the Job exists, and it's being updated to an invalid status.
 *  (e.g.: multiple 'completed' / 'abandoned' statues to add/reduce points maliciously)
 *  TODO: this can be refactored to use named functions and make code more readable
 */
// TODO: Should we add checks here for extra security? (e.g.: clients submitting REST requests directly..)
JobSchema.pre('save', function(next){

	var job = this;
	job.wasNew = job.isNew;

	// If job submitted is an existing one, we'll check if status update is possible.
	if(!job.isNew) {

		// Status is populated from query that retrieves the job (from update controller)
		// If status is not updated from the client, then it will keep populated.
		// We want it not populated (as an ObjectId) to deal with it
		// that way from the post save hook above
		job.status = job.status._id ? job.status._id : job.status

		// NOTE job.previous_status is populated from job init hook (above).
		if (job.status.id != job.previous_status.id){

			// Getting config of previous job status
			var previous_job_status_config = _.find(config.staticdata.jobStatuses, _.matchesProperty('_id', job.previous_status));

			// Checking if new status is allowed
			var next_status_found = _.find(previous_job_status_config.possible_next_statuses, _.matchesProperty('_id', job.status));
			if (!next_status_found) {
				return next(new Error('No es posible actualizar el trabajo al resultado seleccionado.'));
			}

		}
		// job.updatePoints();
		return next();
	}
	else // if it's a new one, then search for other existing jobs from the same user, supplier, services,
	// and recently created..
	{

		// TODO: make limit configurable?
		var recentJobLimitDate = new Date();
		recentJobLimitDate.setMonth(recentJobLimitDate.getMonth() - 1); // setting limit to a month ago..

		// TODO: find patterns on users loading multiple jobs for different services on the same supplier
		// on close/similar dates...astroturfing...
		// Maybe check for IP address of the job being submitted (from controller?)?
		job.constructor.find(
			{	user: job.user.toString(),
				service_supplier: job.service_supplier.toString(),
				services: {$in: job.services},
				created_date: {$gte: recentJobLimitDate}
			}, function(err, jobs) {
				if(err) {
					// TODO: add logging here...
					return next(new Error()) // throwing an error with empty message will return the default message...
				}
				else{
					if(jobs.length) {
						return next(new Error('No es posible agregar trabajos ' +
						' para el mismo proveedor y los mismos servicios en el periodo de un mes.'));

					}
				}

				// job.updatePoints();
				return next();

			});

	}


})


/** Get jobs with a status that can be used to add a review.
 *
 */

JobSchema.statics.getJobsForReview = function(serviceSupplierId, userId, callback){

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
/**
 * Get ratings average for a given supplier...
 */
JobSchema.statics.getServiceSupplierRatingsAverage = function (serviceSupplierId, callback)
{
	this.aggregate(
		[
			{ "$match": { "service_supplier": mongoose.Types.ObjectId(serviceSupplierId) } }, // docs to match
			{ "$unwind": "$review"},
			{ "$unwind": "$review.ratings"},
			{ "$group": {
				"_id": null, // no need to group the avg total by using a specific field, since we want the grand avg.
				"ratingsAvg" : {"$avg" : "$review.ratings.rate"}
			}}
		], function (err, ratingsAverage) {
			if (err)
				callback(err, null)
			else
				callback(null, ratingsAverage[0].ratingsAvg)

		});


}
			
			
			
			
mongoose.model('Job', JobSchema);
/**
 ******************** End Jobs related section
 */