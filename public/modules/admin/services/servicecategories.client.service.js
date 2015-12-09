'use strict';

//ServiceCategories service used to communicate ServiceCategories REST endpoints
angular.module('admin')
	.factory('ServiceCategories',
		function($resource) {
			return $resource('servicecategories/:servicecategoryId/:currentPage/:itemsPerPage');
		})
	.factory('ServiceCategoriesAdmin',
		function($resource) {
			return $resource('servicecategories-admin/:servicecategoryId/:currentPage/:itemsPerPage', { servicecategoryId: '@_id'
			}, {
				query: { method: 'GET', isArray: false },
				update: { method: 'PUT'}
			});
		});