'use strict';

var mongoose = require('mongoose'),
    config = require(__base + 'config/config'),
    _ = require('lodash');

/*exports.validateRatingsRequired = function validateRatingsRequired(ratings){

    return ratings.length;

};*/ // -- MOVED TO REQUIRED VALIDATOR ON REVIEW MODEL

exports.validateRatingsValues = function validateRatingsValues(ratings){


    var job = this.ownerDocument();
    var jobStatus;

    if(!job.review_already_existed) // using this condition to avoid extra checks if the review already existed...
    {
        if(job.isNew || job.isUpdated){
            jobStatus = job.status;
        }
        else{
            if(job.isApproved) jobStatus = job.target_status;
            else jobStatus = job.approval_challenge_details.status;
        }
        for(var i=0;i<ratings.length;i++){
            var rating_type_config = config.staticdata.ratingTypes.getByProperty('_id',ratings[i].type);
            if(!rating_type_config || !_.find(rating_type_config.jobstatuses, jobStatus))
                return false;

        }
    }
    return true;

};


// TODO: Validate if review is required when status is finished/post_finished
// Need to prevent reviews from being updated or from adding multiple...
// Prevent from updates/approval/challenges by removing review from request object if review_already_existed?
// E.g.: removeReviewIfExisted('review' / 'approval_review')
// And from function removeReviewIfExisted(reviewPath)
// if(job.review_already_existed) {
//      delete jobDataSubmitted[reviewPath]
// }
// Add test for this too.
//


