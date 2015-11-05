'use strict';

//ServiceCategories service used to communicate ServiceCategories REST endpoints
angular.module('servicecategories').factory('ServiceCategories', ['$resource',
	function($resource) {
		return $resource('servicecategories/:servicecategoryId', { servicecategoryId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);