'use strict';

angular.module('admin')
	.factory('Jobs',
		function($resource) {
			return $resource('jobs/:jobId', { jobId: '@_id' });
		})
	.factory('JobsAdmin',
		function($resource) {
			return $resource('jobs-admin/:jobId/:currentPage/:itemsPerPage', { jobId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});