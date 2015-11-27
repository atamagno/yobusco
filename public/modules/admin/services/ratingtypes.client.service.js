'use strict';

angular.module('admin')
	.factory('RatingTypesAdmin',
		function($resource) {
			return $resource('ratingtypes/:ratingtypeId/:currentPage/:itemsPerPage', { ratingtypeId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});