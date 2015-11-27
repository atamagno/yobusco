'use strict';

angular.module('admin')
	.factory('ReviewsAdmin',
		function($resource) {
			return $resource('reviews/:reviewId/:currentPage/:itemsPerPage', { reviewId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});