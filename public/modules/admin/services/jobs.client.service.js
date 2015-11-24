'use strict';

angular.module('admin')
	.factory('JobsAdmin',
		function($resource) {
			return $resource('jobs/:jobId/:currentPage/:itemsPerPage', { jobId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});