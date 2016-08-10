'use strict';

angular.module('jobs')
	.factory('JobDetails', // TODO: accepted change from develop (jobs branch had this as 'JobSearch') 
		function($resource) {
			return {
				jobs: $resource('jobs-by-user/:jobUserId/:isServiceSupplier/:status/:currentPage/:itemsPerPage', { jobUserId: '@_id'},
					{
						'query':  { method: 'GET', isArray: false },
					}),
				jobsForReview: $resource('jobs-for-review/:serviceSupplierId/:userId')
			}
		});