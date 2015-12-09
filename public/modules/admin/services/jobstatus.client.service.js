'use strict';

angular.module('admin')
	.factory('JobStatus',
		function($resource) {
			return $resource('jobstatus');
		})
	.factory('JobStatusAdmin',
		function($resource) {
			return $resource('jobstatus-admin/:jobstatusId/:currentPage/:itemsPerPage', { jobstatusId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});