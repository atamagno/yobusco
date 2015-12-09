'use strict';

angular.module('admin')
	.factory('Reviews',
		function($resource) {
			return $resource('reviews');
		})
	.factory('ReviewsAdmin',
		function($resource) {
			return $resource('reviews-admin/:reviewId/:currentPage/:itemsPerPage', { reviewId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});