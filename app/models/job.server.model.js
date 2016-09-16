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
	created_by: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	createdByUser: { // TODO: can this be a virtual field by checking created_by.roles?
					 // Currently the app seems not to to manage a user that has both
					 // user and servicesupplier roles, but we should think about that.
					 // E.g.: change role from nav bar at the top and selecting default role
					 // at login from profile.
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
	target_status: {
		type: Schema.ObjectId,
		ref: 'JobStatus'
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
	review: [ReviewSchema],// NOTE: mongoose 3.8.0 is not accepting a single document schema (: ReviewSchema) embedded,
						   // so using an array for now (even while each job will contain one single review)
						   // When upgrading to 4.x versions of mongoose, getting a memory leak issue
	                       // TODO: review this so upgrade can be done and single review is used like:
						   // review: ReviewSchema
						   // After the upgrade, the function getServiceSupplierRatingsAverage
	                       // can just use "$unwind": "$review.ratings",
						   // instead of "$unwind": "$review" and "$unwind" : "$review.ratings".
						   // More changes will be required on client side to not use array any more.
						   // and also under post save hook + init functions.
						   // TODO: Ok, it seems that using node v0.12.7 + mongoose @4.2.10
						   // (with package.json having "mongoose": "~4.2.3" works with a single review)
	                       // revisit this later and apply changes....
						   // As a side benefit, promises can be used with mongoose 4.2.x, so we can
						   // take advantage of them for nested queries where multiple callbacks are used.

	initial_approval_status: {
		type: Schema.ObjectId,
		ref: 'JobApprovalStatus'
	},
	subsequent_approval_status: {
		type: Schema.ObjectId,
		ref: 'JobApprovalStatus',
		default: null
	},
	last_updated_by: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	last_updated: {
		type: Date,
		default: Date.now
	}

});

JobSchema.set('toJSON', {virtuals: true});


JobSchema.path('services').validate(function(services) {
	return services.length;
},"Por favor seleccione uno o mas servicios para el trabajo.");

JobSchema.virtual('approver').get(function(){

	return this.getJobApprover();

});

/*JobSchema.virtual('submitter').get(function(){

	return getJobSubmitter(this);

});*/


JobSchema.methods.setJobDefaultsForReview = function(){

	this.name = 'Trabajo';
	this.description = '.';
	this.finish_date = this.start_date;
	this.expected_date = this.start_date;

}

JobSchema.post('init', function(job){

	// Storing current status value and review in new paths/properties,
	// to be checked by post save hooks.

	// TODO: check if job.isModified('status') is a better approach rather than using these aux paths
	job.previous_status = job.status._id ? job.status._id : job.status;
	job.review_already_existed = job.review[0] ? true : false;
	// job.previous_approval_status = job.getApprovalStatus();

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

			// NOTE: Population of points,job_counts,overall_rating is only required when job is new.
			// If being updated, it seems service supplier is already a model (populated from the query
			// under job update controller). Maybe use job.wasNew that is set from pre save hook below to differentiate?
			// This was failing without this population for updated jobs (when supplier was supposed to be populated already),
			// so test it. Not sure why these values need to be populated for the supplier, since they're not ref ids....
			// NOTE: we're already populating service supplier (user field only) from pre save hook,
			// so maybe we can take advantage of that and populate these ones too.
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

			//if(job.previous_approval_status != 'approved' && job.getApprovalStatus() == 'approved'){

			//}

			if(job.approved) { // TODO: test this does not pass when job approval status is set to pending

				// TODO: Check if all the below now makes sense with now checking approvals?

				// NOTE: job.previous_status is set from schema post init hook (function above)
				job.service_supplier.updateJobCounts(job.previous_status, job.status);

				// var job_status_config = _.find(config.staticdata.jobStatuses, _.matchesProperty('_id', job.status));

				var job_status_config = config.staticdata.jobStatuses.getByProperty('_id', job.status);
				//if(job.wasNew)
				//{
				//	job.service_supplier.updatePoints(job_status_config.points * job.services.length);
				//}
				//else {
				//	if (!job.status.equals(job.previous_status)) { // probably can use job.updatingStatus here...
						job.service_supplier.updatePoints(job_status_config.points * job.services.length);
				//	}
				//}

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
				//else{return done(null, job.service_supplier)}


			}
			return done(null, job.service_supplier);


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
 *  TODO: Should we add checks here for extra security? (e.g.: clients submitting REST requests directly..) */
JobSchema.pre('validate',function(next){

	var job = this;

	// TODO: this needs to be updated to check for target_status?
	// Or is status fine - and then we'll do the switch from pre save?
	// Don't think the client is submitting target_status now....

	// If job submitted is an existing one, we'll check if status update is possible.
	if(!job.isNew) {

		job.status = job.status._id ? job.status._id : job.status;

		// If job is being approved/rejected, we'll check couple of things...
		if(job.approving)
		{
			// Checking if current approval status is pending. If not, then there's nothing to approve...
			if(job.getApprovalStatus() != 'pending'){
				return next(new Error('El trabajo no se encuentra pendiente de aprobacion.'));
			}

			// Checking that approver is valid
			if(!job.approvingUser.equals(job.getJobApprover())){
				return next(new Error('El usuario no esta autorizado a aprobar el trabajo.'));
			}

		}
		else{

			if(job.getApprovalStatus() == 'approved'){ // Only if job is in approved status, we'll accept changes...

				// If status is being updated, we'll check if the transition to next status is possible...
				// NOTE job.previous_status is populated from job init hook (above).
				// TODO: would job.isModified('status') work better here?
				if (!job.status.equals(job.previous_status)){

					// Getting config of previous job status
					var previous_job_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.previous_status);

					// Checking if new status is allowed
					var next_status_found = _.find(previous_job_status_config.possible_next_statuses, _.matchesProperty('_id', job.status));
					if (!next_status_found) {
						return next(new Error('No es posible actualizar el trabajo al resultado seleccionado.'));
					}
					job.updatingStatus = true; // flag for pre save hook, to know status is being updated, and take action.
				}

			}
			else{
					return next(new Error('No es posible actualizar el trabajo en su estado actual.'));
			}
		}

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
				return next();
			});
	}

});

JobSchema.pre('save',function(next){

	var job = this;
	job.wasNew = job.isNew;

	// If job is new, we'll set the initial_approval_status to pending so it gets approved afterwards.
	// We'll also set the status to 'Created' - which will be the default status for all new jobs -
	// and save the status submitted from the client under target_status.
	if(job.isNew){
		job.populate('service_supplier', 'user' ,function(err) { // TODO: test with invalid supplier...
			if(err){
				return next(new Error());
			}
			job.initial_approval_status = config.staticdata.jobApprovalStatuses.getByProperty('keyword', 'pending');
			job.subsequent_approval_status = null;
			job.target_status = job.status;
			job.status = config.staticdata.jobStatuses.getByProperty('keyword', 'created');
			return next();
		});
	}
	else {

		// If job is being approved, update approval status (to either 'approved' or 'challenged')
		if(job.approving){
			job.setApprovalStatus(job.approved);
			if(job.approved){ // If effectively approved, set status to target status,
							  // and set target status to null to be prepared for next status update.
				job.depopulate('target_status');
				job.status = job.target_status;
				job.target_status = null;
			}
		}
		else{
			  // If an update is being done: keep the previous status, and set the target_status
			  // to the desired one, so it gets approved afterwards...
			  // Set approval status to pending as well.
			  if(job.updatingStatus){
				  job.setApprovalStatus('pending');
				  job.target_status = job.status;
				  job.status = job.previous_status;
			  }
		}
		return next();
	}


});

/** Get jobs with a status that can be used to add a review.
 *
 */
JobSchema.statics.getJobsForReview = function(serviceSupplierId, userId, callback){

	this.find({user: userId, service_supplier: serviceSupplierId})
		.populate([{path: 'services', select: 'name'}, {path: 'status'}])
		.exec(
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
					// var completedJobStatusConfig = _.find(config.staticdata.jobStatuses, _.matchesProperty('keyword', 'finished'));
					var completedJobStatusConfig = config.staticdata.jobStatuses.getByProperty('keyword', 'finished');

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

JobSchema.methods.getJobApprover = function(){

	// NOTE: whenever comparing a mongoose path that can be a document (populated) or an ObjectId (not populated) -,
	// such as job.user below - always use the .equals method to compare with an ObjectId.
	// This ensures that:
	// If it's a model, then it will compare against the _id property of both.
	// If it's an ObjectId, then it will compare against the .id property of both.
	// This makes the model/logic agnostic of whether the document has been populated or not
	// and allows to use the same logic for created docs (e.g.: that have not been populated) and queried docs (populated)
	// See http://mongoosejs.com/docs/api.html#document_Document-equals (document)
	// And ..\node_modules\mongoose\node_modules\bson\lib\bson\objectid.js (ObjectId)

	// TODO: add check for initial_approval_status / subsequent == pending, since those should
	// be the only statuses that require an approver...
	// Consider challenged jobs too...since admin should be the actual approver...
	var job = this;
	if(job.user.equals(job.last_updated_by)){
		return job.service_supplier.user;
	}
	else{
		if(job.populated('user')){
			return job.user._id;
		}
		else{
			return job.user;
		}

	}

	// TODO: define what to do when the initial_approval_status or subsequent_approval_status
	// is 'challenged' (since the approver will actually have to be a sys admin).

}

JobSchema.methods.setApprovalStatus = function(approved){

	var job = this;
	var approvalStatus;

	// Getting approval/challenged/pending job approval statuses to update the job.
	switch (approved)
	{
		case true:
			approvalStatus = config.staticdata.jobApprovalStatuses.getByProperty('keyword','approved')._id;
			break;
		case false:
			approvalStatus = config.staticdata.jobApprovalStatuses.getByProperty('keyword','challenged')._id;
			break;
		case 'pending':
			approvalStatus = config.staticdata.jobApprovalStatuses.getByProperty('keyword','pending')._id;
			break;
		default:
			return;
	}

	// Checking if job was initially approved. If not we'll use initial approval.
	if(!job.initial_approval_status.equals(config.staticdata.jobApprovalStatuses.getByProperty('keyword','approved')._id))
	{
		job.initial_approval_status = approvalStatus;
	}
	else{
		// If previously approved, we'll use subsequent approval status for this approval/challenge.
		job.subsequent_approval_status = approvalStatus;
	}
}

JobSchema.methods.getApprovalStatus = function(){

	var job = this;

	// Checking if job has been subsequently approved.
	// If that's the case, then subsequent approval is the one ruling. Otherwise, initial should be.
	if(job.subsequent_approval_status != null){
		return job.subsequent_approval_status.keyword;
	}
	else{
		return job.initial_approval_status.keyword;
	}

	// Other approaches:
	// 1- Check if initial is different than approved.
	// If that's the case, then initial is still ruling.
	/*if(job.initial_approval_status.keyword != 'approved')
	{
		return job.initial_approval_status.keyword;
	}
	else{
		return job.subsequent_approval_status.keyword;
	}*/

	// 2- Check if the job is in created status (approval status will be the initial one).

}




			
mongoose.model('Job', JobSchema);
/**
 ******************** End Jobs related section
 */