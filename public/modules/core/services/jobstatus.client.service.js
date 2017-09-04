'use strict';

angular.module('core')
	.factory('JobStatusHelper',
		function(JobStatusReasonsHelper){
			return {

                getInitialStatuses: function(jobStatuses, roles){

                    var initialStatuses = [];
                    for(var i=0; i<jobStatuses.length;i++)
                    {
                        if(jobStatuses[i].initial && jobStatuses[i].roles.indexOf(roles[0]) != -1){ // assumes user is either supplier or user, so just comparing against
                                                                                                    // first element of the roles array
                            initialStatuses.push(jobStatuses[i]);
                        }
                    }
                    return initialStatuses;

                },
			    getPossibleNextStatuses: function(currentStatus,roles, keepCurrentStatus){

			        var possibleNextStatuses = [];
			        if (keepCurrentStatus === undefined){
			            keepCurrentStatus = true;
                    }

			        if(currentStatus.keyword != 'created' && keepCurrentStatus){
			            possibleNextStatuses.push(currentStatus); // assumes current status is allowed for the user role...
                                                                  // TODO: test with a current status that is not allowed for user updating/challenging job...
                                                                  // (possible at all?)
                    }

			        for(var i=0;i<currentStatus.possible_next_statuses.length;i++){

			            if(currentStatus.possible_next_statuses[i].roles.indexOf(roles[0]) != -1){ // assumes user is either supplier or user, so just comparing against
                                                                                                   // first element of the roles array
                            possibleNextStatuses.push(currentStatus.possible_next_statuses[i]);
                        }

                    }

                    return possibleNextStatuses;

                },
                getPossibleChallengeStatuses: function(currentStatus, currentStatusReason, targetStatus, targetStatusReason, statusReasons,roles){

			        // To return:
			        // ***** Current status with current reason:
                    //      - Supplier accepted an incomplete, then moved to finished, but user states it's still incomplete.
                    //      - Don't limit challenge reason to the current reason only (maybe just pre-populate it - THIS IS PENDING)
                    // Other possibilities:
                    // ***** Possible next statuses based on role.
                    // ***** If target status is within the possible ones (which should be) offer it only in case there's a target reason
                    //       AND there are target status reason/s for the challenging role.


                    var possibleNextStatuses = this.getPossibleNextStatuses(currentStatus,roles);
                    var possibleChallengeStatuses = [];
                    for(var i=0;i<possibleNextStatuses.length;i++)
                    {
                        if(possibleNextStatuses[i]._id != targetStatus._id){
                            possibleChallengeStatuses.push(possibleNextStatuses[i]);
                        }
                        else{
                             if(targetStatusReason)
                             {
                                 var possibleJobStatusReasons = JobStatusReasonsHelper.getReasons(statusReasons,targetStatus,roles);
                                 if(possibleJobStatusReasons.length > 1 ||
                                   (possibleJobStatusReasons.length == 1 && possibleJobStatusReasons[0]._id != targetStatusReason._id))
                                 {
                                     possibleChallengeStatuses.push(possibleNextStatuses[i]);
                                 }

                             }
                        }
                    }
                    return possibleChallengeStatuses;
				},
                getStatusesForReview: function(jobStatuses, roles){

                    var jobStatusesForReview = [];
                    for(var i=0; i<jobStatuses.length;i++)
                    {
                        if((jobStatuses[i].finished || jobStatuses[i].keyword == 'nothired') &&
                           (jobStatuses[i].roles.indexOf(roles[0]) != -1)){
                            jobStatusesForReview.push(jobStatuses[i]);
                        }
                    }
                    return jobStatusesForReview;

                }

			};
	});

