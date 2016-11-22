'use strict';

angular.module('jobs')
	.factory('JobDetails',
		function($resource) {
			return {
				jobs: $resource('jobs-by-user/:status/:currentPage/:itemsPerPage', {},
					{
						'query':  { method: 'GET', isArray: false }
					}),
				jobsForReview: $resource('jobs-for-review/:serviceSupplierId/:userId')
			}
		});