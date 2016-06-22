'use strict';

angular.module('jobs')
	.factory('JobDetails',
		function($resource) {
			return {
				jobs: $resource('jobs-by-user/:jobUserId/:isServiceSupplier/:status/:currentPage/:itemsPerPage', { jobUserId: '@_id'},
					{
						'query':  { method: 'GET', isArray: false },
					}),
				reviews: $resource('reviews-by-job/:jobId', { jobId: '@_id'}),
				jobsForReview: $resource('jobs-for-review/:serviceSupplierId/:userId')
			}
		});