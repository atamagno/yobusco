'use strict';

angular.module('servicesubcategories').factory('ServiceSubcategories',
	function($resource) {
		return $resource('servicesubcategories/:servicesubcategoryId', { servicesubcategoryId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	});