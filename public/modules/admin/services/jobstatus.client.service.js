'use strict';

angular.module('admin')
	.factory('JobStatusAdmin',
		function($resource) {
			return $resource('jobstatus/:jobstatusId/:currentPage/:itemsPerPage', { jobstatusId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});