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
 *  TODO: maybe extract Rating and Review schemas in a different file and require them from here?
 * to make this file simpler and focus on job?
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
}/*, {_id: false}*/);

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
}/*,{_id: false}*/);

/** This allows the ratingsAvg virtual attribute (below) to be added to Job reviews
 *  when using the toJSON function.
 */
ReviewSchema.set('toJSON', {virtuals: true});

/**
 Virtual to store the review ratings average.
 This will be returned when using the doc.toJSON method
 */
ReviewSchema.virtual('ratingsAvg').get(function(){

	return parseFloat(this.getRatingsAvg());

});

/**
 Returns the review ratings average.
 */
ReviewSchema.methods.getRatingsAvg = function(){
	var ratingsTotal = 0;
	this.ratings.forEach(function(rating){
		ratingsTotal += rating.rate;
	})
	return (ratingsTotal / this.ratings.length).toFixed(2);

}

/**
 Returns the points the supplier gains, based on the ratings average.
 */
ReviewSchema.methods.getPointsFromRatingsAvg = function(){
	var ratingsAvg = this.getRatingsAvg();
	return _.find(config.staticdata.reviewRatingsAvgPointsRanges,function(reviewRatingsAvgPointsRange){
		return reviewRatingsAvgPointsRange.min <= ratingsAvg && ratingsAvg  <= reviewRatingsAvgPointsRange.max

	}).points;

}

/**
 Returns the points the supplier gains, based on the 'recommend to a friend' action.
 */
ReviewSchema.methods.getPointsFromRecommend = function(){
	var points = 0;
	if(this.recommend != null)
	{
		var recommendPoints =  _.find(config.staticdata.userSupplierActionPoints, _.matchesProperty('action_name','recommend'));
		points = this.recommend ? recommendPoints.points.yes : recommendPoints.points.no;
	}
	return points;
}

/**
 Returns the points the supplier gains, based on the different points associated to a review
 * (ratings average and 'recommend to a friend' for now.
 */
ReviewSchema.methods.getPoints = function(){
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

var ApprovalChallengeDetails = new Schema({
	status: {
		type: Schema.ObjectId,
		ref: 'JobStatus',
		required: true
	},
	comments: {
		type: String
	},
	created: {
		type: Date,
		default: Date.now
	}},
	{_id: false});

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
	approval_challenge_details: ApprovalChallengeDetails,
	challenges: {
		type: [ApprovalChallengeDetails],
		default: []
	}
},{timestamps:{createdAt: 'created_date', updatedAt: 'last_updated_date'}});

JobSchema.set('toJSON', {virtuals: true});


JobSchema.path('services').validate(function(services) {
	return services.length;
},"Por favor seleccione uno o mas servicios para el trabajo.");

JobSchema.virtual('approver').get(function(){

	return this.getJobApprover();

});

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

});

/**
 Updates supplier job count, points, category and overall rating
 considering the status of the job and values within the review (if being submitted).
 TODO: this can be refactored by using named functions for those actions in the async.waterfall
 */
JobSchema.post('save',function postSave(job){

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

			// TODO: since we are using the same supplier at the state of querying the job...
			// it might be possible that two jobs for the same supplier get an approval
			// thus, the point updates may conflict with each other.
			// Check if the populate of points, job counts and overall rating above gets the latest during
			// concurrent updates.
			// If not, then we may need to use job.service_supplier.findAndUpdate() approach?


			// We'll update job counts and supplier points from job status only if the job is being approved,
			// or the update requires no approval.
			if(job.approval || job.no_approval_required) {
				// NOTE: job.previous_status is set from schema post init hook (function above)
				job.service_supplier.updateJobCounts(job.previous_status, job.status);
				var job_status_config = config.staticdata.jobStatuses.getByProperty('_id', job.status);
				job.service_supplier.updatePoints(job_status_config.points * job.services.length);
			}


			var job_review_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.getJobStatusForReview());
			// We'll account for a review submitted only if:
			// - There was no review added for the job
			// + A review has been submitted with this last update
			// + The status submitted as part of this update (based on operation performed --> job approval or update)
			//   is a finished one.
			if(!job.review_already_existed && job.review[0]
				&& job_review_status_config && job_review_status_config.finished){

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
			else{

				return done(null, job.service_supplier);
			}


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

// TODO: this function can be refactored to use named functions and make code more readable.
// Maybe move them to a job.server.model.validations.helper file (maybe under ./app/models/helpers/)?
// and require at the top of this file?
// TODO: check where the same validations are being performed for the different cases, and optimize as needed...
/**
 * Pre save validations to verify data is correct for new and existing jobs.
 *
*/
JobSchema.pre('save',function validate(next){

	var job = this;
	job.status = job.status._id ? job.status._id : job.status;


	if(!job.isNew) {
		switch(job.update_action){

			// TODO:Is it better to add validation inline/functions within job schema for some of these?
			case 'approval':
				// Checking if job actually needs an approval
				if(job.getApprovalStatus() != 'pending'){
					return next(new Error('El trabajo no se encuentra pendiente de aprobacion.'));
				}

				// Checking that approving user matches the job approver.
				var jobApprover = job.getJobApprover();
				if(!job.approval_user.equals(jobApprover)){
					return next(new Error('El usuario no esta autorizado a aprobar el trabajo.'));
				}

				// Checking approval action is valid. (true = approve - false = reject/challenge)
				if(job.approval != true && job.approval != false){
					return next(new Error('La aprobacion del trabajo no es valida.'))
				}
				// TODO: check here that job.approval_challenge_details.status is a possible proposed status
				// from the user role  - similar to update below under this code:
				// Checking that status is valid, and is also allowed for the user role submitting it.

				// In case approver is rejecting (challenging) the status update
				// we'll check if the status submitted in the challenge details is a possible one, from current status.
				if(!job.approval && (!job.approval_challenge_details ||
					!config.staticdata.jobStatuses.isNextPossible(job.status,job.approval_challenge_details.status))){
					return next(new Error('No es posible rechazar el trabajo, utilizando el estado solicitado.'));
				}

				// Checking if the job already has a review, and if a new review is being submitted.
				// Since each job can only accept a review, we'll prevent multiple from being added.
				if(job.review[0] && job.approval_review){
					return next(new Error('No es posible ingresar mas de una calificacion para el mismo trabajo.'));
				}
				// TODO: maybe also validate that job.approval_review has valid content?
				// Maybe assign it in a pre('validate') hook so it gets validated?
				// Do the same when normal review is submitted? (during update/creation)

				// TODO: add review validations just like done for new jobs (see below)
				// TODO: check that review is not modified or added twice

				// In case the approver is the job user, we'll check that a review is being submitted,
				// when status being approved/challenged is a finished one.
				if((job.user.equals(jobApprover) && !job.review[0]) &&
				   ((job.approval && job.target_status.finished) ||
				   (!job.approval &&
				   config.staticdata.jobStatuses.getByProperty('_id', job.approval_challenge_details.status).finished))){
				   if(!job.approval_review){
					   return next(new Error('Es necesario calificar al prestador de servicios para aprobar/rechazar el trabajo.'));
				   }
				   job.adding_review = true;
				}
				break;

			case 'resolution':
				if(job.resolution_user.roles.indexOf('admin') == -1){
					return next(new Error('El usuario no esta autorizado a resolver el estado del trabajo.'));
				}

				if(job.getApprovalStatus() != 'challenged'){
					return next(new Error('El trabajo no se encuentra pendiente de resolución.'));
				}

				if(!job.resolution || (job.resolution != 'target' && job.resolution  != 'challenge')){
					return next(new Error('No es posible resolver el trabajo con la resolución ingresada'));
				}
				break;

			case 'update':
				// Only if job is in approved status, we'll accept changes...
				if(job.getApprovalStatus() == 'approved'){

					if(!job.status.equals(job.previous_status)){

						// Checking that status is valid, and is also allowed for the user role submitting it.
						var job_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.status);
						if(job_status_config){
							var allowedRoles = _.intersection(job_status_config.roles, job.last_updated_by.roles);
							if(allowedRoles.length == 0){
								return next(new Error('El estado seleccionado no esta permitido para el usuario.'));
							}
						}
						// Checking that status submitted can be used, based on previous status.
						if(!config.staticdata.jobStatuses.isNextPossible(job.previous_status,job.status)){
							return next(new Error('No es posible actualizar el trabajo al estado seleccionado.'));
						}

						job.updating_status = true; // flag for pre save hook, to know status is being updated,
													// and take action.

						// TODO: add review validations just like done for new jobs (see below)
						// TODO: check that review is not modified or added twice
					}
				}
				else{
					return next(new Error('No es posible actualizar el trabajo en su estado actual.'));
				}
				break;
		}
		return next();
	}
	else {
		// if it's a new one, then search for other existing jobs from the same user, supplier, services,
		// and recently created..

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
					return next(new Error()); // throwing an error with empty message will return the default message...
				}
				else{
					if(jobs.length) {
						return next(new Error('No es posible agregar trabajos ' +
						' para el mismo usuario/prestador y los mismos servicios en el periodo de un mes.'));

					}
				}

				// Checking that an initial status is being used to create the job
				var job_status_config = config.staticdata.jobStatuses.getByProperty('_id', job.status);
				if(!job_status_config || !job_status_config.initial){
					return next(new Error('Por favor seleccione un estado valido para crear el trabajo.'));
				}

				// TODO: reproduce these validations on job update and approval...
				// Maybe we can reuse the same logic?
				// Checking that supplier is not adding a review when creating the job
				if(job.review[0] && job.created_by.roles.indexOf('servicesupplier') != -1){
					return next(new Error('No es posible agregar una calificacion como prestador de servicios.'));
				}

				// Checking that a review is not being added using a not finished status
				if(job.review[0] && !job_status_config.finished){
					return next(new Error('No es posible agregar una calificacion utilizando el estado seleccionado'));
				}

				// Checking that use is adding a review, when creating the job using a finished status
				if(job.review[0] && job_status_config.finished && job.created_by.roles.indexOf('user') != 1){
					return next(new Error('Es necesario agregar una calificacion al ' +
										  'crear el trabajo con el estado seleccionado'));
				}

				return next();
			});
	}

});


// TODO: this function can be refactored to use named functions and make code more readable
/**
 * Pre save logic to set job data correctly before storing on db.
 *
 */
JobSchema.pre('save',function preSave(next){

	var job = this;
	job.wasNew = job.isNew;

	if(job.isNew){
		job.populate('service_supplier', 'user' ,function(err) {
			if(err){
				return next(new Error());
			}

			// If job is new, we'll check if approval is required.
			// If required, we'll set the approval status to pending so it gets approved afterwards.
			// We'll also set the status to 'created' - which will be the default status for all new jobs that require
			// approval - and we'll save the status submitted from the client under target_status.
			if(job.isApprovalRequired()){
				job.setApprovalStatus('pending');
				job.target_status = job.status;
				job.status = config.staticdata.jobStatuses.getByProperty('keyword', 'created');
			}
			else{
				// If no approval is required, we'll set the approval status to approved (true).
				// And set the no_approval_required flag so as the post save hook knows how to proceed.
				job.setApprovalStatus(true);
				job.no_approval_required = true;
			}
			job.subsequent_approval_status = null;
			return next();
		});
	}
	else {

		switch(job.update_action){
			case 'approval':
				job.setApprovalStatus(job.approval);
				if(job.approval){ // If effectively approved, set status to target status,
					              // and set target status to null to be prepared for next status update.
					job.status = job.populated('target_status');
					job.target_status = null;
				}
				else{ // If rejecting the update, store the challenge details in challenges array.
					job.challenges.push(job.approval_challenge_details);
				}

				if(job.adding_review){
					job.review.push(job.approval_review);
				}
				break;

			case 'resolution':
				job.setApprovalStatus(true); // setting approval status to 'approved' since we're resolving the challenge

				// TODO: save the challenge resolution somewhere here?
				// So we know in favor of whom (supplier vs. user) the challenge was resolved...
				// Then from post save, we can make that count to the supplier/user...
				if(job.resolution == 'target'){
					job.status = job.populated('target_status');
				}
				else{
					job.status = job.populated('approval_challenge_details.status');
				}
				job.approval_challenge_details = null;
				job.target_status = null;
				job.no_approval_required = true;
				break;

			case 'update':
				// If an update is being done: keep the previous status, and set the target_status
				// to the desired one, so it gets approved afterwards...
				// Set approval status to pending as well.
				if(job.updating_status){
					if(job.isApprovalRequired()){
						job.setApprovalStatus('pending');
						job.target_status = job.status;
						job.status = job.previous_status;
					}
					else{
						job.no_approval_required = true;
					}
				}
				break;
		}
		return next();
	}


});

/**
 * Get jobs with a status that can be used to add a review.
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
 * Get ratings average for a given supplier, from its list of jobs.
 */
JobSchema.statics.getServiceSupplierRatingsAverage = function (serviceSupplierId, callback) {
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

/**
 * Get the user that needs to approve the job, based on who made the latest update.
 */
JobSchema.methods.getJobApprover = function(){

	var job = this;

	if(job.getApprovalStatus() != 'pending'){
		return null;
	}

	if(job.user.equals(job.last_updated_by._id)){
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

}

/**
 * Get the role of the job approver
 * TODO: possibility to merge this logic with getJobApprover() function above.
 */
JobSchema.methods.getJobApproverRole = function(){

	var job = this;
	if(job.user.equals(job.last_updated_by._id)){
		return 'servicesupplier';
	}
	else{
		return 'user';
	}

}


/**
 * Update the job approval status.
 */
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

	if(job.initial_approval_status == null){
		job.initial_approval_status = approvalStatus;
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

/**
 * Get the job current approval status.
 */
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

}

/** Get the status to be checked when a review is being submitted
 *  NOTE: reviews can be submitted in different ways:
 *  - When updating a job to a completed status
 *  - When approving/rejecting a job.
 *  - Submitting a review from service supplier details.
 *  TODO: Should we consider creation as a different scenario?
 * */
JobSchema.methods.getJobStatusForReview = function(){

	var job = this;

	switch (job.update_action){

			case 'approval':
				if(job.approval){
					return job.status;
				}
				else{
					return job.approval_challenge_details.status;
				}
				break;

			case 'update':
				if(job.updating_status){
					if(job.no_approval_required){
						return job.status;
					}
					else{
						return job.target_status;
					}

				}
				break;

			default:
				return job.status;
	}



}

/**
 * Verify if job requires approval, based on job status and approver role.
 */
JobSchema.methods.isApprovalRequired = function(){

	var job = this;

	// We'll check if the approver role (the one not updating the job)
	// is on the list of roles that need to approve the job status.
	var job_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.status);
	if(job_status_config.requires_approval_by.length > 0 &&
	   job_status_config.requires_approval_by.indexOf(job.getJobApproverRole()) != -1){
	   	return true;
	}
	else{
		return false;
	}

}

mongoose.model('Job', JobSchema);
/**
 ******************** End Jobs related section
 */