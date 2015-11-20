'use strict';

angular.module('jobs')
	.factory('Jobs',
		function($resource) {
			return $resource('jobs/:jobId', { jobId: '@_id'
			}, {
				update: { method: 'PUT' }
			});
		})
	.factory('JobsStatus',
		function($resource) {
			return $resource('jobstatus');
		});