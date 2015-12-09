'use strict';

angular.module('admin')
	.factory('ServiceSubcategories',
		function($resource) {
			return $resource('servicesubcategories');
		})
	.factory('ServiceSubcategoriesAdmin',
		function($resource) {
			return $resource('servicesubcategories-admin/:servicesubcategoryId/:currentPage/:itemsPerPage', { servicesubcategoryId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});