'use strict';

var config = require(__base + 'config/config'),
    _ = require('lodash'),
    mongoose = require('mongoose');


/**
 * Function: validate that status is a valid one.
 * @param status
 * @returns {boolean}
 */
exports.validateStatusValue = function validateStatusValue(status) {

    var job = this;

    if ((job.isNew || job.isUpdated) && !config.staticdata.jobStatuses.getByProperty('_id',status))
        return false;

    return true;

};

/**
 * Function: validate that status is a valid initial one, when creating the job.
 * @param status
 * @returns {boolean}
 */
exports.validateStatusInitial = function validateStatusInitial(status){

    var job = this;

    if(job.isNew && !job.status_config.initial && !status.equals(config.staticdata.jobStatuses.enums.NOTHIRED))
        return false;

    return true;

};

/**
 * Function: validate that user creating/updating the job is allowed to use the submitted status
 * @param status
 * @returns {boolean}
 */
exports.validateStatusPermission = function validateStatusPermission(status){

    var job = this;

    // Status change is checked in case job is updated, but not the status field (e.g.: uploading/removing images...)
    if(job.isNew || (job.isUpdated && !status.equals(job.previous_status))){
        var allowedRoles = _.intersection(job.status_config.roles, job.last_updated_by.roles);
        if(allowedRoles.length == 0)
            return false;
    }
    return true;

};

/**
 * Function: validate that status submitted can be used to transition from previous status.
 * @param status
 * @returns {boolean}
 */
exports.validateStatusNext = function validateStatusNext(status){

    var job = this;

    if((job.isNew || job.isUpdated) && !status.equals(job.previous_status)
        && !config.staticdata.jobStatuses.isNextPossible(job.previous_status,status))
        return false;

    return true;

};

/**
 * Function: validate that a review is submitted when required:
 * Status is changing, by user, to a finished/post_finished/nothired status.
 * @param status
 * @returns {boolean}
 */
/*exports.validateReviewRequired = function validateReviewRequired(status) {

    var job = this;
    // TODO: test updates and creation...
    // Check approvals/rejections...(review maybe still required - and status won't necessarily change....)
    // So maybe we just need to check if action is different than resolution? And it will apply to all?
    // Or maybe not even check for isNew / isUpdated / isApproved / isChallenged...

    if((job.isNew || job.isUpdated) && !status.equals(job.previous_status) && job.last_updated_by.roles.indexOf('user') != -1
        && (job.status_config.finished || job.status_config.post_finished || job.status_config.keyword == 'nothired')
        && !job.review.length)
    {
        return false;
    }
    return true;

};*/


/**
 * Function: validate that a review is submitted when required:
 * Status is changing, by user, to a finished/post_finished/nothired status.
 * @param status
 * @returns {boolean}
 */
exports.validateReviewRequired = function validateReviewRequired() {

     var job = this;
     // TODO: test updates and creation...
     // Check approvals/rejections...(review maybe still required - and status won't necessarily change....)
     // So maybe we just need to check if action is different than resolution? And it will apply to all?
     // Or maybe not even check for isNew / isUpdated / isApproved / isChallenged...

     if(((job.isNew || job.isUpdated) && job.status && !job.status.equals(job.previous_status) &&
         job.last_updated_by.roles.indexOf('user') != -1) &&
         (job.status_config.finished || job.status_config.post_finished || job.status_config.keyword == 'nothired'))
            return true;

     return false;

 };



/**
 * Function: validate that a review is NOT submitted if NOT required based on status.
 * @param review
 * @returns {boolean}
 */
exports.validateReviewNotAllowedByStatus = function validateReviewNotAllowedByStatus(review) {

     var job = this;
     // Test updates / approval/challenges...
     // This is failing when status is being updated to in progress from user, after finished
     // (and a review was added during finished...)

     if((job.status && !job.status_config.finished && !job.status_config.post_finished && job.status_config.keyword != 'nothired' &&
       (job.isNew || job.isUpdated) && !job.status.equals(job.previous_status) && review.length)
       ||
       (job.isApproved && (!job.target_status_config.finished && !job.target_status_config.post_finished) &&
        !job.review_already_existed && review.length))
        return false;
         // TODO: how is this being executed for approvals, if status/review is not changing for approvals?
         // (only approval_review is submitted)? Same in not allowed by supplier function below...
         // TODO: can these conditions be simplified?
         // TODO: are we considering review not allowed for challenges on challenge details validator?
         // If so, should we move it here just like review not allowed by supplier?

     return true;

 };



/**
 * Function: validate that a review is NOT submitted by a service supplier
 * @param status
 * @returns {boolean}
 */
exports.validateReviewNotAllowedByServiceSupplier = function validateReviewNotAllowedByServiceSupplier(review) {

    var job = this;
    // TODO: test updates...and...this is not checking status....
    // (status check really needed if we're checking review_already_existed?)
    if(((job.isNew || job.isUpdated) && job.last_updated_by.roles.indexOf('servicesupplier') != -1
        && !job.review_already_existed && review.length) ||
       ((job.isApproved || job.isChallenged) && job.approval_user.roles.indexOf('servicesupplier') != -1 &&
         !job.review_already_existed && review.length))
        return false;

    return true;

};


/**
 * Function: validate that status reason is submitted if required by the status, and the user role
 * @param status
 * @returns {boolean}
 */
exports.validateStatusReasonRequired = function validateStatusReasonRequired(){

    var job = this;
    if((job.isNew || job.isUpdated) && job.isStatusReasonRequired /*&& !job.status_reason*/)
        return true;

    return false;

};



// NOTE: on the check for '&& statusReason' on value, not allowed, permission and updated validations...
// --> We need to do it in case a statusReason is specified, even if not required.
// --> Also to ensure other conditions using the status reason will not break (e.g.: statusReason.equals)
/**
 * Function: validate that status reason is a valid one, and also that applies for the job status.
 * @param statusReason
 * @returns {boolean}
 * NOTE: the check for isStatusReasonRequired (even while there is a validator for that --> validateStatusReasonRequired)
 * is still required since, in case of updates, it's possible that a previous status had a status reason, but the
 * new one does not require it. Without this check, the previous status reason will be compared against the new
 * status, and this check will fail during updates. Same applies for validateStatusReasonNotAllowed function
 * (and possibly others).
 */
exports.validateStatusReasonValue = function validateStatusReasonValue(statusReason){

    var job = this;

    if((job.isNew || job.isUpdated) && statusReason && job.isStatusReasonRequired &&
        (!config.staticdata.jobStatusReasons.getByProperty('_id', statusReason)
        || !job.status_reason_config.jobstatus.equals(job.status)))
        return false;

    return true;

};

/**
 * Function: validate that status reason is not submitted for a status that does not require one.
 * @param statusReason
 * @returns {boolean}
 */
exports.validateStatusReasonNotAllowed = function validateStatusReasonNotAllowed(statusReason){

    var job = this;

    if((job.isNew || job.isUpdated) && !job.isStatusReasonRequired
        && statusReason && !statusReason.equals(job.previous_status_reason))
        return false;

    return true;

};

/**
 * Function: validate that user creating/updating the job is allowed to use the submitted status reason.
 * @param statusReason
 * @returns {boolean}
 */
exports.validateStatusReasonPermission = function validateStatusReasonPermission(statusReason){

    var job = this;

    // Comparison of statusReason with previous value is done because of the user possibly updating
    // other fields (not necessarily the status reason).
    // If we don't have that condition, then the check of role will fail if the existing status reason role
    // is not allowed for the role updating the job...
    if((job.isNew || job.isUpdated) && statusReason && !statusReason.equals(job.previous_status_reason) &&
        job.status_reason_config.role && job.last_updated_by.roles.indexOf(job.status_reason_config.role) == -1)
        return false;

    return true;

};


/**
 * Function: validate that status reason is not being updated (if job status is not changing).
 * @param statusReason
 * @returns {boolean}
 */
exports.validateStatusReasonUpdated = function validateStatusReasonUpdated(statusReason){

    var job = this;

    if(job.isUpdated && statusReason && job.status.equals(job.previous_status) &&
       job.previous_status_reason && !statusReason.equals(job.previous_status_reason))
       return false;

    return true;

};

/**
 * Function: validate that services are required when job is created and status is different than 'not hired'.
 * @param services
 * @returns {boolean}
 */
exports.validateServicesRequired = function validateServicesRequired(services){

  var job = this;

  if(job.isNew && job.status && !job.status.equals(config.staticdata.jobStatuses.enums.NOTHIRED) &&
      (!services || services.length == 0))
        return false;

  return true;

};






/**
 * Function: validate that all services submitted are offered by supplier.
 * @param services
 * @returns {boolean}
 */
exports.validateServicesForSupplier = function validateServicesForSupplier(services){

    var job = this;

    if(job.isNew){
        for(var i = 0;i<services.length;i++){
            if(job.service_supplier_config.services.indexOf(services[i]) == -1){
                return false;
            }
        }
    }
    return true;
};

/**
 * Function: validate that user for the job is a valid user.
 * @param user
 * @returns {boolean}
 * TODO: is this really needed? Given that the other validator (validateUserCreatedBy) will check for valid user anyway?
 * Try removing it...
 */
exports.validateUserValue = function validateUserValue(user, cb) {

    var job = this;

    if (job.isNew) {
        mongoose.model('User').findOne({'_id': user, 'roles': 'user'}).exec(function (err, user) {
            if (err || !user)
                cb(false);
            else
                cb(true);
        });
    }
    else{
        cb(true);
    }

};

/**
 * Function: validate that user is not creating a job for a different one.
 * @param user
 * @returns {boolean}
 */
// TODO: remove extra {} in functions where there's only if and else.
// Can probably remove the else in these type of functions.
exports.validateUserCreatedBy = function validateUserCreatedBy(user) {

    var job = this;

    if(job.isNew && job.created_by.roles.indexOf('user') != -1 && !job.created_by.equals(user))
        return false;

    return true;

};

/**
 * Function: validate that service supplier is not creating a job for a different one.
 * @param user
 * @returns {boolean}
 */
exports.validateServiceSupplierCreatedBy = function validateServiceSupplierCreatedBy() {

    var job = this;

    if(job.isNew && job.created_by.roles.indexOf('servicesupplier') != -1 && !job.created_by.equals(job.service_supplier_config.user))
        return false;

    return true;

};

// TODO: Prevent update of description, name and services if job is in finished/post finished status...
// What about dates?

/* - When resolving to challenged status --> do validators run multiple times? Why is that?
   - Is it possible to submit challenge details while approving?
    e.g.: to change the status / status reason...

   - Validation of approval_challenge_details is not working on job model validator.
     this is being set to global --> why? Is it because it's a subdocument?

   - Try with approval absent when approving. Just submit action: 'approval'

   - Try submitting approval_challenge_details from update.
     - We can probably add it to the prohibitedJobPaths

   - Is it possible to submit challenge details while updating?
     e.g.: to change the status / status reason...probably not, since we're only extending current job values
     with data submitted during updates..
*/

