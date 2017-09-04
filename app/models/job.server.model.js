'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	_ = require('lodash'),
	config = require(__base + 'config/config'),
	async = require('async'),
	Review = require('./review.server.model'),
	ApprovalChallengeDetail = require('./approvalchallengedetail.server.model'),
	JobModelValidator = require('./helpers/validators/job.server.model.validator');/*,
	ReviewModelValidator = require('./helpers/validators/review.server.model.validator');*/



// NOTE: validators are - at least based on this version and config of mongoose - executed on the different fields.
// If a validator fails on one field, the rest of the validators for that field don't run, but they keep running on other
// fields. Is there a way to stop execution on first failure? Instead of running other fields if one already failed?
// E.g.: from the below - assume validateStatusValue and validateStatusInitial pass, but validateStatusPermission fails
// (all of them apply to the status field). This means, validateStatusNext won't be executed,
// but validators under other fields (e.g.: status_reason, approval_challenge_details, services will still be executed).

/**
 * Start Jobs related section
 *
*/
var JobSchema = new Schema({
	created_by: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'Por favor ingrese un creador para el trabajo.'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'Por favor ingrese un cliente.',
		validate: [
			{validator: JobModelValidator.validateUserValue, msg: 'Por favor ingrese un cliente valido.'},
			{validator: JobModelValidator.validateUserCreatedBy, msg: 'No es posible crear un trabajo para otro usuario.'}
		]
	},
	name: {
		type: String,
		default: '',
		required: 'Por favor ingrese un nombre.',
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
		validate: [
			{validator: JobModelValidator.validateServiceSupplierCreatedBy, msg: 'No es posible crear un trabajo para otro prestador de servicios.'}
		]
	},
	services: [{
		type: Schema.ObjectId,
		ref: 'ServiceSubcategory'
		// required: [JobModelValidator.validateServicesRequired, 'Por favor seleccione uno o mas servicios para el trabajo.']
		// this is not working, try using job.markModified('services') from pre validate hook as a hack as stated here...
		// https://github.com/Automattic/mongoose/issues/1109 - doesn't seem to work either?
		}],
	status: {
		type: Schema.ObjectId,
		ref: 'JobStatus',
		required: 'Por favor seleccione un estado de trabajo.',
		validate: [
			{validator: JobModelValidator.validateStatusValue, msg: 'Por favor seleccione un estado valido para el trabajo.'},
			{validator: JobModelValidator.validateStatusInitial, msg: 'Por favor seleccione un estado valido para crear el trabajo.'},
			{validator: JobModelValidator.validateStatusPermission, msg: 'El estado seleccionado no esta permitido para el usuario.'},
			{validator: JobModelValidator.validateStatusNext, msg: 'No es posible aplicar el estado seleccionado al trabajo.'}
		]
	},
	target_status: {
		type: Schema.ObjectId,
		ref: 'JobStatus',
		default: null
	},
	status_reason: {
		type: Schema.ObjectId,
		ref: 'JobStatusReason',
		required: [JobModelValidator.validateStatusReasonRequired, 'Por favor seleccione una opcion de razon de estado/resultado.'],
		validate: [
			{validator: JobModelValidator.validateStatusReasonValue,msg: 'Por favor seleccione una opcion valida de razon de estado/resultado.'},
			{validator: JobModelValidator.validateStatusReasonNotAllowed,msg: 'No es posible agregar una razon de estado/resultado utilizando el estado seleccionado.'},
			{validator: JobModelValidator.validateStatusReasonPermission,msg: 'La razon de estado/resultado no esta permitida para el usuario.'},
			{validator: JobModelValidator.validateStatusReasonUpdated, msg: 'No es posible actualizar la razon de estado/resultado.'}
		],
		default: null
	},
	target_status_reason: {
		type: Schema.ObjectId,
		ref: 'JobStatusReason',
		default: null
	},
	start_date: {
		type: Date,
		default: Date.now,
		required: 'Por favor ingrese una fecha de inicio.'
	},
	finish_date: {
		type: Date
	},
	pictures: [{
		type: String,
		default: []
	}],
	review: {
		type: [Review],
		required: [JobModelValidator.validateReviewRequired,'Es necesario agregar una calificacion al crear o actualizar el trabajo con el estado seleccionado.'],
		validate: [
			{validator: JobModelValidator.validateReviewNotAllowedByServiceSupplier, msg:'No es posible agregar una calificacion como prestador de servicios.'},
			{validator: JobModelValidator.validateReviewNotAllowedByStatus, msg: 'No es posible agregar una calificacion utilizando el estado seleccionado.'}
		]
	},	   		   		   // NOTE: mongoose 3.8.0 is not accepting a single document schema (: ReviewSchema) embedded,
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
	approval_challenge_details: {
		type: ApprovalChallengeDetail
		//validate: [{validator: JobModelValidator.validateApprovalChallengeDetailsRequired,msg: 'Test'}]
		// NOTE: this validator is not working when declared here, neither using
		// JobSchema.path('approval_challenge_details').validate(function....) as done with services below....
		// 'this' is being set to global, preventing access from parent document (job)
		// Using pre validate hook on approval_challenge_details schema to accomplish this..
		// TODO: WTF, working for reviews? What's the difference with reviews schema?
		// The fact that virtuals and other methods are added to it?
	},
	challenges: {
		type: [ApprovalChallengeDetail],
		default: []
	}
},{timestamps:{createdAt: 'created_date', updatedAt: 'last_updated_date'}});

JobSchema.set('toJSON', {virtuals: true});

// NOTE: for some reason declaring the validator within the schema just like on the other fields,
// doesn't work for this one (the only difference is that services is an array of ObjectIds and the other ones are individual values)
// Check comment at the bottom of this post: http://jasonjl.me/blog/2014/10/23/adding-validation-for-embedded-objects-in-mongoose/
// Try with required: [validateServicesRequired, 'Error message'] - doesn't work
// Check this one too: https://github.com/Automattic/mongoose/issues/1109
// Check this one too: http://stackoverflow.com/questions/43037643/required-subdocuments-mongoose
JobSchema.path('services').validate(JobModelValidator.validateServicesRequired,
									'Por favor seleccione uno o mas servicios para el trabajo.');
JobSchema.path('services').validate(JobModelValidator.validateServicesForSupplier,
									'Uno o mas servicios seleccionados no son ofrecidos por el prestador de servicios.');

JobSchema.virtual('approver').get(function(){

	return this.getJobApprover();

});

JobSchema.methods.setJobDefaultsForReview = function(){

	this.name = 'Trabajo';
	// this.finish_date = this.start_date; --> submitted from client too. Need to add validator for it, depending on job status being submitted.

};

JobSchema.post('init', function(job){

	// Storing current status value and review in new paths/properties,
	// to be checked by post save hooks.

	// TODO: init may executed only on existing jobs
	// If so, then just use id if path is populated from query...
	// Assuming it's a mandatory path. If optional, we need to check for non null/model...
	job.previous_status = job.status._id;
	job.previous_status_reason = job.status_reason instanceof mongoose.Model ? job.status_reason._id : job.status_reason;
								 // NOTE: may not need to check for model of status reason here.
								 // It may be just null or a model (if init is executed only on updates)
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
			// or the update requires no approval, and the job status has changed...
			// Maybe use job.updating_status is easier since this check should be already done?
			// (note: updating_status it not probably being set for new jobs....)
			if(!job.status.equals(job.previous_status) &&
			   (job.isApproved || !job.approval_required)) { // TODO: do not add created jobs here...
														     // add them only once approved or if no approval is needed
				// NOTE: job.previous_status is set from schema post init hook (function above)
				job.service_supplier.updateJobCounts(job.previous_status, job.status);
				var job_status_config = config.staticdata.jobStatuses.getByProperty('_id', job.status);
				job.service_supplier.updatePoints(job_status_config.points * job.services.length);
			}

			// TODO: if we should always account for reviews submitted, should we really check for the
			// status? If not, then we can probably remove the call to getJobStatusForReview and
			// the checks for job_review_status_config in the if below...
			var job_review_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.getJobStatusForReview());
			// We'll account for a review submitted only if:
			// - There was no review added for the job
			// + A review has been submitted with this last update
			// + The status submitted as part of this update (based on operation performed --> job approval or update)
			//   is a finished one or job was not hired...
			if(!job.review_already_existed && job.review[0] &&
				   (job_review_status_config &&
				   (job_review_status_config.finished || job_review_status_config.post_finished ||
				    job_review_status_config.keyword == 'nothired'))){

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


JobSchema.pre('validate', function prevalidateFirst(next){

	var job = this;

	// If status/status reason have been submitted as model/doc, then obtain the id from them.
	// NOTE: depopulate is not working on job updates, since when extending the document retrieved from db
	// and applying the data items submitted from client, populated paths are not kept populated.
	// The approach below works, though...
	/*job.depopulate('status');
	job.status_config = config.staticdata.jobStatuses.getByProperty('_id',job.status) || {};
	job.depopulate('status_reason');
	job.status_reason_config =  config.staticdata.jobStatusReasons.getByProperty('_id',job.status_reason) || {};
	job.depopulate('target_status');
	job.target_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.target_status) || {};
	job.depopulate('target_status_reason');
	job.target_status_reason_config =  config.staticdata.jobStatusReasons.getByProperty('_id',job.target_status_reason) || {};*/


	job.status = job.status instanceof mongoose.Model ? job.status._id : job.status;
	// TODO: replace config.staticdata.jobStatuses.getByProperty('_id',job.status) with this in all sections...
	job.status_config = config.staticdata.jobStatuses.getByProperty('_id',job.status) || {};

	job.status_reason = job.status_reason instanceof mongoose.Model ? job.status_reason._id : job.status_reason;
	job.status_reason_config =  config.staticdata.jobStatusReasons.getByProperty('_id',job.status_reason) || {};

	job.target_status = job.target_status instanceof mongoose.Model ? job.target_status._id : job.target_status;
	job.target_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.target_status) || {};

	job.target_status_reason = job.target_status_reason instanceof mongoose.Model ?
							   job.target_status_reason._id : job.target_status_reason;
	job.target_status_reason_config =  config.staticdata.jobStatusReasons.getByProperty('_id',job.target_status_reason) || {};


	job.isStatusReasonRequired = job.isStatusReasonRequired(); // to be used by several validators.
	if(job.isNew){
		// Getting service supplier data to be used during validation.
		// TODO: move this section to a validator/helper?
		//this.markModified('services');
		if(job.service_supplier){
			mongoose.model('ServiceSupplier').findById(job.service_supplier, 'user services').exec(function(err, service_supplier){
				if(err || !service_supplier){
					next(new Error('Por favor ingrese un prestador de servicios valido.'));
				}
				else{
					job.service_supplier_config = 	service_supplier;
					next();
				}
			});

		}
		else{
			return next(new Error('Por favor ingrese un prestador de servicios.'));
		}
	}
	else{
		job.setPrevalidateFlagsAndConfig();
		next();
	}

});





// TODO: this function can be refactored to use named functions and make code more readable.
// Maybe move them to a job.server.model.validations.helper file (maybe under ./app/models/helpers/)?
// and require at the top of this file?
// TODO: check where the same validations are being performed for the different cases, and optimize as needed...
/**
 * Pre save validations to verify certain data is correct for existing jobs.
 *
 */
JobSchema.pre('validate',function prevalidateSecond(next){

	var job = this;

	if(job.isUpdated){

		if(job.getApprovalStatus().equals(config.staticdata.jobApprovalStatuses.enums.APPROVED)) {
			if (!job.status.equals(job.previous_status)) { // TODO: may need to keep this condition to set
				// job.updating_status flag
				// Don't want to do it from validator....

				// TODO: moved this already, to JobModelValidator (validateStatus function)
				// Checking for valid status submitted
				// var job_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.status);
				/* if(!job_status_config){
				 return next(new Error('Por favor seleccione un estado valido para actualizar el trabajo.'));
				 }*/

				// TODO: moved this already, to JobModelValidator (validateStatusPermission function)
				// Applied to new jobs too, since job.last_updated_by is also populated...
				// Checking that status is valid, and is also allowed for the user role submitting it.
				/*var allowedRoles = _.intersection(job_status_config.roles, job.last_updated_by.roles);
				 if(allowedRoles.length == 0){
				 return next(new Error('El estado seleccionado no esta permitido para el usuario.'));
				 }*/

				// TODO: moved this already?? to JobModelValidator (validateStatusNext function) - TEST!
				// Checking that status submitted can be used, based on previous status.
				/*if(!config.staticdata.jobStatuses.isNextPossible(job.previous_status,job.status)){
				 return next(new Error('No es posible actualizar el trabajo al estado seleccionado.'));
				 }*/

				// TODO: move this to update section of setPrevalidateFlagsAndConfig function for updates
				// and rename to job.isUpdatingStatus
				job.updating_status = true;

				// TODO: add review validations just like done for new jobs (see below)
				// TODO: check that review is not modified or added twice

			}
		}
		else{
			return next(new Error('No es posible actualizar el trabajo en su estado actual.'));
		}
	}

	if(job.isApproval){

		// Checking if job actually needs an approval
		if(!job.getApprovalStatus().equals(config.staticdata.jobApprovalStatuses.enums.PENDING)){
			return next(new Error('El trabajo no se encuentra pendiente de aprobacion.'));
		}

		// Checking that approving user matches the job approver.
		// TODO: Worth to explore populating approver from init? Instead of calling it here?
		// If we do it, what is the impact for other workflows (create, update, etc?)
		var jobApprover = job.getJobApprover();
		if(!jobApprover || !job.approval_user.equals(jobApprover)) {
			return next(new Error('El usuario no esta autorizado a aprobar o rechazar el trabajo.'));
		}

		if(job.isChallenged) {
			if (!job.approval_challenge_details){ // TODO: check this to see if can be moved to validator.
												  // http://jasonjl.me/blog/2014/10/23/adding-validation-for-embedded-objects-in-mongoose/
												  // Try schema.path('appro_ch_...').validate() && schema.path.(....).required()
				return next(new Error('Por favor ingrese los parametros necesarios para rechazar el trabajo.'));
			}

			job.approval_challenge_details_status_config = config.staticdata.jobStatuses
				.getByProperty('_id', job.approval_challenge_details.status) || {};
			job.approval_challenge_details_status_reason_config = config.staticdata.jobStatusReasons
				.getByProperty('_id', job.approval_challenge_details.status_reason) || {};
		}

		// Checking if the job already has a review, and if a new review is being submitted.
		// Since each job can only accept a review, we'll prevent multiple from being added.
		// TODO: check how to resolve this...
		/*if(job.review_already_existed && job.review.length){
			return next(new Error('No es posible ingresar mas de una calificacion para el mismo trabajo.'));
		}*/

		// TODO: maybe also validate that job.approval_review has valid content?
		// Do the same when normal review is submitted? (during update/creation)
		// TODO: add review validations just like done for new jobs (see below)
		// TODO: check that review is not modified or added twice

		// In case the approver is the job user, we'll check that a review is being submitted,
		// when status being approved/challenged is a finished one.
		// TODO: move challenged section to approval challenge details validator (review required)
		if((job.user.equals(jobApprover) && !job.review[0]) &&
			((job.isApproved && job.target_status_config.finished) /*||
			(job.isChallenged &&
			config.staticdata.jobStatuses.getByProperty('_id', job.approval_challenge_details.status).finished)*/)){
			if(!job.review.length){
				return next(new Error('Es necesario calificar al prestador de servicios para aprobar el trabajo.'));
			}
		}
	}



	if(job.isResolved){
		if(!job.getApprovalStatus().equals(config.staticdata.jobApprovalStatuses.enums.CHALLENGED)){
			return next(new Error('El trabajo no se encuentra pendiente de resolución.'));
		}

		if(!job.resolution || (job.resolution != 'target' && job.resolution  != 'challenge')){
			return next(new Error('No es posible resolver el trabajo con la resolución ingresada'));
		}
	}




	/*if(!job.isNew) {
		switch(job.action){

			case 'approval':
				// Checking if job actually needs an approval
				if(!job.getApprovalStatus().equals(config.staticdata.jobApprovalStatuses.enums.PENDING)){
					return next(new Error('El trabajo no se encuentra pendiente de aprobacion.'));
				}

				// Checking that approving user matches the job approver.
				// Worth to explore populating approver from init? Instead of calling it here?
				// If we do it, what is the impact for other workflows (create, update, etc?)
				var jobApprover = job.getJobApprover();
				if(!jobApprover || !job.approval_user.equals(jobApprover)) {
					return next(new Error('El usuario no esta autorizado a aprobar o rechazar el trabajo.'));
				}

				// Checking approval action is valid. (true = approve - false = reject/challenge)
				if(job.approval != true && job.approval != false){
					return next(new Error('La aprobacion del trabajo no es valida.'))
				}


				if(!job.approval && !job.approval_challenge_details){
					return next(new Error('Por favor ingrese los parametros necesarios para rechazar el trabajo.'));
				}


				// TODO: check here that job.approval_challenge_details.status is a possible proposed status
				// from the user role  - similar to update below under this code:
				// Checking that status is valid, and is also allowed for the user role submitting it.


				// In case approver is rejecting (challenging) the status update
				// we'll check if the status submitted in the challenge details is a possible one, from current status.
				// NOTE: this is being executed prior to validation due to being under pre validate function...
				// move to validator, so as approval challenge details missing is validated first
				// (check last test step on Challenge job test case)...
				if(!job.approval && (!job.approval_challenge_details ||
					!config.staticdata.jobStatuses.isNextPossible(job.status,job.approval_challenge_details.status))){
					return next(new Error('No es posible rechazar el trabajo, utilizando el estado solicitado.'));
				}

				// Checking if the job already has a review, and if a new review is being submitted.
				// Since each job can only accept a review, we'll prevent multiple from being added.
				// TODO: maybe more review inside approval_challenge_details instead of outside?
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
				var jobApprover = job.getJobApprover();
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
				if(!job.getApprovalStatus().equals(config.staticdata.jobApprovalStatuses.enums.CHALLENGED)){
					//if(job.getApprovalStatus() != 'challenged'){
					return next(new Error('El trabajo no se encuentra pendiente de resolución.'));
				}

				if(!job.resolution || (job.resolution != 'target' && job.resolution  != 'challenge')){
					return next(new Error('No es posible resolver el trabajo con la resolución ingresada'));
				}
				break;

			case 'update':
				// Only if job is in approved status, we'll accept changes...
				if(job.getApprovalStatus().equals(config.staticdata.jobApprovalStatuses.enums.APPROVED)){
					//if(job.getApprovalStatus() == 'approved'){
					if(!job.status.equals(job.previous_status)){ // TODO: may need to keep this condition to set
						// job.updating_status flag
						// Don't want to do it from validator....

						// TODO: moved this already, to JobModelValidator (validateStatus function)
						// Checking for valid status submitted
						/* var job_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.status);
						 if(!job_status_config){
						 return next(new Error('Por favor seleccione un estado valido para actualizar el trabajo.'));
						 }

						// TODO: moved this already, to JobModelValidator (validateStatusPermission function)
						// Applied to new jobs too, since job.last_updated_by is also populated...
						// Checking that status is valid, and is also allowed for the user role submitting it.
						/*var allowedRoles = _.intersection(job_status_config.roles, job.last_updated_by.roles);
						 if(allowedRoles.length == 0){
						 return next(new Error('El estado seleccionado no esta permitido para el usuario.'));
						 }

						// TODO: moved this already?? to JobModelValidator (validateStatusNext function) - TEST!
						// Checking that status submitted can be used, based on previous status.
						/*if(!config.staticdata.jobStatuses.isNextPossible(job.previous_status,job.status)){
						 return next(new Error('No es posible actualizar el trabajo al estado seleccionado.'));
						 }

						// TODO: move this to update section of setPrevalidateFlagsAndConfig function for updates
						// and rename to job.isUpdatingStatus
						job.updating_status = true;

						// TODO: add review validations just like done for new jobs (see below)
						// TODO: check that review is not modified or added twice
					}

				}
				else{
					return next(new Error('No es posible actualizar el trabajo en su estado actual.'));
				}
				break;
		}
	}*/
	return next();

});


// Moving check for existing jobs in case of adding a new one to this pre save hook.
// So all validations are performed previously, and we only hit the db once again if validations passed.
JobSchema.pre('save',function presaveFirst(next){

	var job = this;

	if(job.isNew) {
		// if it's a new one, then perform data validations and
		// also search for other existing jobs from the same user, supplier, services,
		// and recently created..

		// TODO: moved this already, to JobModelValidator (validateStatusInitial function)
		// Checking that an initial or nothired status is being used to create the job/review
		// var job_status_config = config.staticdata.jobStatuses.getByProperty('_id', job.status);
		/*if(!job_status_config || (!job_status_config.initial && job_status_config.keyword != 'nothired')){
		 return next(new Error('Por favor seleccione un estado valido para crear el trabajo.'));
		 }*/

		// TODO: reproduce these validations on job update and approval...
		// Maybe we can reuse the same logic?
		// Checking that supplier is not adding a review when creating the job
		// Already taken care of from Job Model Validator --> validateReviewNotAllowedByServiceSupplier?
		//if(job.review[0] && job.created_by.roles.indexOf('servicesupplier') != -1){
		//	return next(new Error('No es posible agregar una calificacion como prestador de servicios.'));
		//}

		// Checking that a review is not being added using a not finished and nothired status
		// Already taken care of from Job Model Validator --> validateReviewNotAllowed?
		//if(job.review[0] && !job_status_config.finished && job_status_config.keyword != 'nothired'){
		//	return next(new Error('No es posible agregar una calificacion utilizando el estado seleccionado'));
		//}

		// Already taken care of from validateReviewRequired under Job Model validator?
		// Checking that user is adding a review, when creating the job using a finished or nothired status
		/*if(!job.review[0] && (job_status_config.finished || job_status_config.keyword == 'nothired')
		 && job.created_by.roles.indexOf('user') != -1){
		 return next(new Error('Apa! - Es necesario agregar una calificacion al ' +
		 'crear el trabajo con el estado seleccionado'));
		 }*/

		// Already taken care of from validateStatusReasonRequired under Job Model Validator?
		//if(job_status_config.requires_reason && !job.status_reason){
		//		return next(new Error('Es necesario ingresar una opcion valida de razon de estado/resultado'));
		// TODO: verify if entered reason is valid for the status...
		// Also verify the role requires a reason for this status.
		// config.staticdata.JobStatusReasons.getByProperty('_id', job.status_reason)
		//}

		// TODO: make limit configurable?
		var recentJobLimitDate = new Date();
		recentJobLimitDate.setMonth(recentJobLimitDate.getMonth() - 1); // setting limit to a month ago..

		// TODO: find patterns on users loading multiple jobs for different services on the same supplier
		// on close/similar dates...astroturfing...
		// Maybe check for IP address of the job being submitted (from controller?)?

		var searchCondition = { user: job.user.toString(),
			service_supplier: job.service_supplier.toString()};


		var jobNotHiredStatus = config.staticdata.jobStatuses.enums.NOTHIRED;
		var jobInProgressStatus = config.staticdata.jobStatuses.enums.ACTIVE;
		var jobCreatedStatus = config.staticdata.jobStatuses.enums.CREATED;
		if(!job.status.equals(jobNotHiredStatus)){
			// If user is creating a real job (different than not hired)
			// We'll check:
			// - For jobs with the same service/s than submitted (1) and: recently created (2) or still active (3)
			// - Or a job/review in not hired status (4) that has been recently created (5)
			searchCondition.$or = [{$and:[{services: {$in: job.services}}, // (1)
				{$or: [{created_date: {$gte: recentJobLimitDate}}, // (2)
					{status: {$in: [jobCreatedStatus, jobInProgressStatus]}}]}]}, // (3)
				{$and: [{status:jobNotHiredStatus}, // (4)
					{created_date: {$gte: recentJobLimitDate}}]}]; // (5)
		}
		else
		{	// If user is creating a review (using not hired status) - we'll check:
			// - If there are active jobs or a previous not hired review was created before
			// 	  - we'll allow only one not hired job per user for the same supplier (1)
			// - Or any jobs recently created (regardless their status and services) (2)
			// TODO: maybe set flag here, to know the path, and display a different error below?
			searchCondition.$or = [{status:{$in: [jobCreatedStatus, jobInProgressStatus, jobNotHiredStatus]}}, // (1)
				{created_date: {$gte: recentJobLimitDate}}]; // (2)
		}

		job.constructor.find(searchCondition, function(err, jobs) {
			if(err) {
				// TODO: add logging here...
				return next(new Error()); // throwing an error with empty message will return the default message...
			}
			else{
				if(jobs.length) {
					return next(new Error('No es posible agregar trabajos o calificaciones ' +
					' para el mismo usuario/prestador y los mismos servicios en el periodo de un mes.'));
				}
			}

			return next();
		});
	}
	else{
		return next();
	}

});

// TODO: this function can be refactored to use named functions and make code more readable
/**
 * Pre save logic to set job data correctly before storing on db.
 *
 */
JobSchema.pre('save',function presaveSecond(next){

	var job = this;
	job.wasNew = job.isNew;

	if(job.isNew){ // TODO: populate user here too? Which field?
				   // This will be done to have cleaner code under getJobApprover, but will impact performance.
		           // So, not doing it now...
		job.populate('service_supplier', 'user' ,function(err) {
			if(err){
				return next(new Error());
			}

			// If job is new, we'll check if approval is required.
			// If required, we'll set the approval status to pending so it gets approved afterwards.
			// We'll also set the status to 'created' - which will be the default status for all new jobs that require
			// approval - and we'll save the status submitted from the client under target_status.
			if(job.isApprovalRequired()){
				job.setApprovalStatus(config.staticdata.jobApprovalStatuses.enums.PENDING);
				job.target_status = job.status;
				job.target_status_reason = job.status_reason;
				job.status = config.staticdata.jobStatuses.enums.CREATED;
				job.status_reason = null;
				job.approval_required = true;
			}
			else{
				// If job was not hired, we'll set the job approval accordingly.
				// If no approval is required, we'll set the approval status to approved (true).
				// And set the approval_required flag so as the post save hook knows how to proceed.
				var job_status_config = config.staticdata.jobStatuses.getByProperty('_id', job.status);
				if(job_status_config.keyword == 'nothired'){
					   job.setApprovalStatus(config.staticdata.jobApprovalStatuses.enums.NOTHIRED);
				}
				else{
					job.setApprovalStatus(config.staticdata.jobApprovalStatuses.enums.APPROVED);
				}
				job.approval_required = false;
			}
			job.subsequent_approval_status = null; // TODO: is this really needed if default in schema is null?
			return next();
		});
	}
	else {

		switch(job.action){
			case 'approval':
				job.setApprovalStatus(job.isApproved ? config.staticdata.jobApprovalStatuses.enums.APPROVED :
													 config.staticdata.jobApprovalStatuses.enums.CHALLENGED);
				if(job.isApproved){ // If effectively approved, set status to target status,
					              // and set target status to null to be prepared for next status update.
					              // Same for status reason...
					job.status = job.target_status;
					job.status_reason = job.target_status_reason; // need populated here?
					job.target_status = null;
					job.target_status_reason = null;
				}
				else{ // If rejecting the update, store the challenge details in challenges array.
					job.challenges.push(job.approval_challenge_details);
				}

				/*if(job.approval_review){
					job.review.push(job.approval_review);
				}*/
				break;

			case 'resolution':
				// setting approval status to 'approved' since we're resolving the challenge
				job.setApprovalStatus(config.staticdata.jobApprovalStatuses.enums.APPROVED);

				// TODO: save the challenge resolution somewhere here?
				// So we know in favor of whom (supplier vs. user) the challenge was resolved...
				// Then from post save, we can make that count to the supplier/user...
				if(job.resolution == 'target'){
					job.status = job.target_status;
					job.status_reason = job.target_status_reason;
				}
				else{
					job.status = job.populated('approval_challenge_details.status');
					job.status_reason = job.populated('approval_challenge_details.status_reason');
					// If a finish date was received during challenge, set job finish date to that one.
					if(job.approval_challenge_details.finish_date){
                            job.finish_date = job.approval_challenge_details.finish_date;
					}
					else{
						// Otherwise, check if finished date entered originally does not apply due to the challenge being resolved
						// in favor of a non finished status (e.g.: job was updated/created to/as finished, but challenged to in progress), and nullify the date
						// if that's the case.
						if(job.target_status_config.finished && job.finish_date && !job.approval_challenge_details.status.post_finished &&
                           !job.approval_challenge_details.status.finished){
							job.finish_date = null;
						}
					}

				}
				job.approval_challenge_details = null;
				job.target_status = null;
				job.target_status_reason = null;
				job.approval_required = false;
				break;

			case 'update':
				// If status is being updated and approval is required:
				// 1- Keep the previous status and set the target_status to the desired one
				// so it gets approved afterwards...
				// 2- Set approval status to pending as well.
				// 3- Set approval_required flag so post save hook knows how to proceed.
				// We also update status reason and target accordingly
				if(job.updating_status){
					if(job.isApprovalRequired()){ // TODO: call function on pre validate/defaults and set isApprovalRequired?
						job.setApprovalStatus(config.staticdata.jobApprovalStatuses.enums.PENDING);
						job.target_status = job.status;
						job.status = job.previous_status;
						job.approval_required = true; // would approval_required work the same with isApprovalRequired
													  // from post save hook?
						if(job.isStatusReasonRequired){
							// setting target value for approval, and maintaining previous status reason
							job.target_status_reason = job.status_reason;
						}
                        job.status_reason = job.previous_status_reason;
						//else{
							// Testing here...
							//	job.status_reason = job.previous_status_reason;

                            // Original code -
							// Clearing value if status reason is not required for the new status
                            // (in case there was one for the previous status)
							// NOTE: this is probably wrong, since it will nullify the previous status reason
							// and the new status requires approval, so the previous status reason should still no
							// transition to null.
							// job.status_reason = null;
							// TODO: need to set target_status_reason to null here as well?
							// Maybe not, as it is not allowed for updates and should be null from previous
							// approvals/resolutions..
						// }
					}
					else{
						// NOTE: we don't need to set job status and status reason when there's no approval required here.
						// Since it should have been sent from client, and validated at this point already.
						// Same applies for target_status and target_status_reason?
						// Test with a status that requires approval first, and then update to another one
						// with and without approval...
						job.setApprovalStatus(config.staticdata.jobApprovalStatuses.enums.APPROVED);
						// job.target_status = null; // this may not be needed
						job.approval_required = false;
						if(!job.isStatusReasonRequired){
							job.status_reason = null;
						}
					}

				}
				/*job.approval_required = false;
				/var job_status_config = config.staticdata.jobStatuses.getByProperty('_id', job.status);
				if(job.updating_status && job.isApprovalRequired()){
						job.setApprovalStatus(config.staticdata.jobApprovalStatuses.enums.PENDING);
						job.target_status = job.status;
						job.status = job.previous_status;
						job.approval_required = true;
						if(job_status_config.requires_reason){ // Add check for reasons based on role...reuse new property?
															   // isStatusReasonRequired?
							job.target_status_reason = job.status_reason;
							job.status_reason = job.previous_status_reason;
						}
						else{
							job.status_reason = null;
						}
				}
				else{
						if(!job_status_config.requires_reason){ // Add check for reasons based on role...reuse new method?
							job.status_reason = null;
						}
				}*/
				break;
		}
		return next();
	}


});

/**
 * Get jobs that can be used to add a review.
 * TODO: maybe move this to jobs controller?
 */
JobSchema.statics.getJobsForReview = function(serviceSupplierId, userId, callback){

	var jobApprovedStatus = config.staticdata.jobApprovalStatuses.enums.APPROVED;

	this.find({user: userId,
			   service_supplier: serviceSupplierId,
			   $or: [{$and: [{initial_approval_status: jobApprovedStatus, subsequent_approval_status: null}]},
							 {subsequent_approval_status: jobApprovedStatus}],
			   review: []
			   }).populate([{path: 'services', select: 'name'},
        					{path: 'status',
            					populate: {path: 'possible_next_statuses', select: 'keyword name finished post_finished requires_reason roles'}},
							{path: 'status_reason'}
				  ])
			     .exec(function(err, jobs){
						if(err)
						{
							// TODO: add and return specific error logging here... / or maybe just return an empty array?
							callback(err,null)
						}
						else
						{
							callback(null, jobs)

						}
					});

};

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
				callback(err, null);
			else
				callback(null, ratingsAverage[0].ratingsAvg)

		});


};


JobSchema.methods.isStatusReasonRequired = function(){

	var job = this;
	if(job.status_config.requires_reason){
		var statusReasons = config.staticdata.jobStatusReasons.getMultipleByProperty('jobstatus', job.status);
		statusReasons = _.filter(statusReasons, function(statusReason){
			return statusReason.role ? _.includes(job.last_updated_by.roles,statusReason.role) : true;
		});
		if(statusReasons.length){
			return true;
		}
	}
	return false;

};

/**
 * Get the user that needs to approve the job, based on who made the latest update.
 */
JobSchema.methods.getJobApprover = function(){

	var job = this;

	if(!job.getApprovalStatus().equals(config.staticdata.jobApprovalStatuses.enums.PENDING)){
	 return null;
	}


	if(job.last_updated_by.equals(job.user)){
		return job.service_supplier.user;
	}
	else{
		// NOTE: we're returning the approver when performing toJSON (on new and updated jobs)
		// On updated jobs, the user is populated, but for new ones it's not, so that's why we need this condition.
		// TODO: what if we depopulate the user on prevalidate??
		if(job.populated('user')){
			return job.user._id;
		}
		else{
			return job.user;
		}

	}

};

/**
 * Get the job current approval status.
 */
JobSchema.methods.getApprovalStatus = function(){

	var job = this;

	// Checking if job has been subsequently approved.
	// If that's the case, then subsequent approval is the one ruling. Otherwise, initial should be.
	if(job.subsequent_approval_status != null){
		// return job.subsequent_approval_status.keyword;
		return job.subsequent_approval_status;
	}
	else{
		// return job.initial_approval_status.keyword;
		return job.initial_approval_status;
	}

};

/**
 * Get the role of the job approver
 * TODO: possibility to merge this logic with getJobApprover() function above.
 */
JobSchema.methods.getJobApproverRole = function(){

	var job = this;
	if(job.last_updated_by.equals(job.user)){
		return 'servicesupplier';
	}
	else{
		return 'user';
	}

};


/**
 * Update the job approval status.
 */
JobSchema.methods.setApprovalStatus = function(approvalStatus){

	var job = this;
	if(job.initial_approval_status == null){
		job.initial_approval_status = approvalStatus;
		return;
	}

	// Checking if job was initially approved. If not we'll use initial approval.
	if(!job.initial_approval_status.equals(config.staticdata.jobApprovalStatuses.enums.APPROVED))
	{
		job.initial_approval_status = approvalStatus;
	}
	else{
		// If previously approved, we'll use subsequent approval status for this approval/challenge.
		job.subsequent_approval_status = approvalStatus;
	}
};


/**
 *  Get the status to be checked when a review is being submitted
 *  NOTE: reviews can be submitted in different ways:
 *  - When updating a job to a completed status
 *  - When approving/rejecting a job.
 *  - Submitting a review from service supplier details.
 *  - Submitting a review from job details (when admin approved a challenged job to a finished status)
 *    and approver/challenger was the service supplier.
 * */
JobSchema.methods.getJobStatusForReview = function(){

	var job = this;
	if (job.action == 'approval') {
		if (job.isApproved) {
			return job.status;
		}
		else {
			return job.approval_challenge_details.status;
		}
	}
	else{
		if(!job.approval_required){
			return job.status;
		}
		else{
			return job.target_status;
		}
	}
};

/**
 * Verify if job requires approval, based on job status and approver role.
 */
JobSchema.methods.isApprovalRequired = function(){

	var job = this;

	// We'll check if the approver role (the one not updating the job)
	// is on the list of roles that need to approve the job status.
	// TODO: can we use job.status_config instead of retrieving again here???
	var job_status_config = config.staticdata.jobStatuses.getByProperty('_id',job.status);
	if(job_status_config.requires_approval_by.length > 0 &&
	   job_status_config.requires_approval_by.indexOf(job.getJobApproverRole()) != -1){
	   	return true;
	}
	else{
		return false;
	}

};

JobSchema.methods.setPrevalidateFlagsAndConfig = function setPrevalidateFlagsAndConfig(){

	var job = this;

	// NOTE: if this seems to work for validators and makes sense,
	// use these flags from pre and post save hooks (instead of job.action)...
	// TODO: Test new changes on job server model validator.
	// If all works, apply validations with new config utilities set below,
	// to the approval challenge detail model validator...
	if(!job.isNew){
		switch (job.action){
			case 'approval':
				job.isApproval = true;
				if(job.approval){
					job.isApproved = true;
				}
				else{
					job.isChallenged = true;
					// job.approval_challenge_details = job.approval_challenge_details ? job.approval_challenge_details : {};
					// NOTE: adding the line above we ensure approval_challenge_details object is generated.
					// If not received in the request (expression above evaluates to {} ), and
					// we end up with an approval_challenge_details object including just the created property,
					// which defaults to current time. Then, validation on job server model, takes place,
					// but context (this) is not the job, but rather global.
					// There might be a way to fix the context (e.g.: binding the validator) somehow
					// E.g.: https://github.com/Automattic/mongoose/issues/3771
					// But maybe we can just get rid of the approval challenge details validator on job model,
					// and just run the validators of approval challenge details fields...
					// Is this.validate(function(){}) an option to validate conditionally not required fields
					// such as approval_challenge_details?
					// See: https://github.com/Automattic/mongoose/issues/2746 (example #1 vs. example #2)
					//if(job.approval_challenge_details){
					/*job.approval_challenge_details_status_config = config.staticdata.jobStatuses
							.getByProperty('_id', job.approval_challenge_details.status) || {};
					job.approval_challenge_details_status_reason_config = config.staticdata.jobStatusReasons
							.getByProperty('_id', job.approval_challenge_details.status_reason) || {};*/
					//}
					//else{
					//	job.approval_challenge_details_status_config = {};
					//	job.approval_challenge_details_status_reason_config = {};
					//}
				}
				break;
			case 'resolution':
				job.isResolved = true;
				break;
			default:
				job.isUpdated = true;
		}
	}

}

mongoose.model('Job', JobSchema);
/**
 ******************** End Jobs related section
 */