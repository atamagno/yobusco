'use strict';

//ServiceCategories service used to communicate ServiceCategories REST endpoints
angular.module('admin').factory('ServiceCategories',
	function($resource) {
		return $resource('servicecategories/:servicecategoryId', { servicecategoryId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	});