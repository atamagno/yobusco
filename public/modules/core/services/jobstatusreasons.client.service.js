'use strict';

angular.module('core')
	.factory('JobStatusReasons',
		function($resource) {
			return $resource('jobstatusreasons', {},
				{
					query: { method: 'GET', cache: true, isArray: true }
				});
		})
	.factory('JobStatusReasonsHelper',
		function(){
			return {
				getReasons: function(jobstatusreasons, status, roles){
					var statusreasons = [];
					if(status.requires_reason){
						for (var i = 0; i < jobstatusreasons.length; i++) {
							if(jobstatusreasons[i].jobstatus == status._id &&
								(!jobstatusreasons[i].role || roles.indexOf(jobstatusreasons[i].role) != -1)){
								statusreasons.push(jobstatusreasons[i]);
							}
						}
					}
					return statusreasons;
				}

			};
	});

