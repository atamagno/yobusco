'use strict';

var config = require(__base + 'config/config'),
    _ = require('lodash');

// NOTE: in some scenarios (e.g.: job being challenged/resolved - which is when challenge details are updated)
// the validators are executed more than once.
// It may be related to this mongoose bug: https://github.com/Automattic/mongoose/issues/2617


exports.validateStatusValue = function validateStatusValue(status){

    var job = this.ownerDocument();

    if(job.isChallenged && !config.staticdata.jobStatuses.getByProperty('_id', status))
        return false;

    return true;

};


exports.validateStatusChallenged = function validateStatusChallenged(status){

    var job = this.ownerDocument();

    // Validating that:
    // - Status used for challenge is a possible next one for the current status.
    // - If there was no target reason, the same status cannot be used (really not challenging anything)
    // - If there was a target reason and the same status is used:
    // --- There should be a challenged status_reason
    // --- And it should be different than the challenged one.

    if(job.isChallenged &&
        ((!config.staticdata.jobStatuses.isNextPossible(job.status, status)) ||
        (!job.target_status_reason && job.target_status.equals(status)) ||
        (job.target_status_reason && job.target_status.equals(status) &&
        (!job.approval_challenge_details.status_reason ||
        job.target_status_reason.equals(job.approval_challenge_details.status_reason)))))
      return false;

    return true;

};

exports.validateStatusPermission = function validateStatusPermission(){

    var job = this.ownerDocument();

    if(job.isChallenged){
        var allowedRoles = _.intersection(job.approval_challenge_details_status_config.roles, job.approval_user.roles);
        if(allowedRoles.length == 0)
            return false;

    }
    return true;

};

exports.validateReviewRequired = function validateReviewRequired(){

    var job = this.ownerDocument();
    var jobApprover = job.getJobApprover();

    if(job.isChallenged && job.user.equals(jobApprover) && !job.review.length &&
        job.approval_challenge_details_status_config.finished)
        return false;

    return true;
};

exports.validateReviewNotAllowedByStatus = function validateReviewNotAllowedByStatus() {

    var job = this.ownerDocument();

    if(job.isChallenged && !job.approval_challenge_details_status_config.finished &&
       !job.approval_challenge_details_status_config.post_finished && job.review.length)
        return false;

    return true;

};

// TODO: should we move this to job model validator given approvals is considered there
// and approval_review is not part of approval challenge details? Probably should...
// TODO: Is this being already validated on job model validator??? Check the same for other review related validators here...
exports.validateReviewNotAllowedByServiceSupplier = function validateReviewNotAllowedByServiceSupplier(){

    var job = this.ownerDocument();
    var jobApprover = job.getJobApprover();

    // job.review_already_existed is checked to verify if a review was previously added (e.g.: from user)
    // and supplier is really not adding it...
    if(job.isChallenged && job.service_supplier.user.equals(jobApprover) &&
        !job.review_already_existed && job.review.length)
        return false;

    return true;


};

/*exports.validateStatusReasonRequired = function validateStatusReasonRequired(status){

    var job = this.ownerDocument();

    // Would job.approval_challenge_details.status be an _id or populated? Think it's an ID...it's submitted as that from client.
    // What if we submit a model from soapUI?

    // NOTE: test when there are no reasons matching the status and/or the role.
    // Is statusReasons undefined? Or just an empty array? (especially due to passing is to _.filter and checking .length


    if(job.isChallenged && job.approval_challenge_details_status_config.requires_reason){
        // TODO: can this be optimized to filter status reasons by job status and role in one line?
        var statusReasons = config.staticdata.jobStatusReasons.getMultipleByProperty('jobstatus', status)
        statusReasons = _.filter(statusReasons, function(statusReason){
            return statusReason.role ? _.includes(job.approval_user.roles,statusReason.role) : true;
        });
        if(statusReasons.length && !job.approval_challenge_details.status_reason){
            return false;
        }
    }
    return true;

};*/


exports.validateStatusReasonRequired = function validateStatusReasonRequired(){

    var job = this.ownerDocument();

    // NOTE: test when there are no reasons matching the status and/or the role.
    // Is statusReasons undefined? Or just an empty array? (especially due to passing is to _.filter and checking .length


    if(job.isChallenged && job.approval_challenge_details_status_config.requires_reason){
        // TODO: can this be optimized to filter status reasons by job status and role in one line?
        var statusReasons = config.staticdata.jobStatusReasons.getMultipleByProperty('jobstatus', job.approval_challenge_details.status);
        statusReasons = _.filter(statusReasons, function(statusReason){
            return statusReason.role ? _.includes(job.approval_user.roles,statusReason.role) : true;
        });
        if(statusReasons.length)
            return true;

    }
    return false;

 };



exports.validateStatusReasonValue = function validateStatusReasonValue(statusReason){

    var job = this.ownerDocument();
    // Read pn code posta txt (search for '- Challenge modal') for details...

    if(job.isChallenged && statusReason &&
        (!config.staticdata.jobStatusReasons.getByProperty('_id', statusReason)
        || !job.approval_challenge_details_status_reason_config.jobstatus.equals(job.approval_challenge_details.status)))
            return false;


    return true;

};

exports.validateStatusReasonPermission = function validateStatusReasonPermission(statusReason){

    var job = this.ownerDocument();

    if(job.isChallenged && statusReason &&
       job.approval_challenge_details_status_reason_config.role &&
       job.approval_user.roles.indexOf(job.approval_challenge_details_status_reason_config.role) == -1)
            return false;

    return true;

};



