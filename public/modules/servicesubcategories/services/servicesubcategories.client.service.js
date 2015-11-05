'use strict';

//Servicesubcategories service used to communicate Servicesubcategories REST endpoints
angular.module('servicesubcategories').factory('ServiceSubcategories', ['$resource',
	function($resource) {
		return $resource('servicesubcategories/:servicesubcategoryId', { servicesubcategoryId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);