'use strict';

angular.module('jobs')
	.factory('JobSearch',
		function($resource) {
			return {
				jobs: $resource('jobs-by-user/:jobUserId/:status', { jobUserId: '@_id'}),
				jobsForReview: $resource('jobs-for-review/:serviceSupplierId/:userId')
			}
		});