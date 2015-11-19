'use strict';

angular.module('admin')
	.factory('ServiceSubcategories',
		function($resource) {
			return $resource('servicesubcategories/:servicesubcategoryId/:currentPage/:itemsPerPage', { servicesubcategoryId: '@_id'
			}, {
				update: { method: 'PUT' }
			});
		})
	.factory('ServiceSubcategoriesAdmin',
		function($resource) {
			return $resource('servicesubcategories/:servicesubcategoryId/:currentPage/:itemsPerPage', { servicesubcategoryId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});