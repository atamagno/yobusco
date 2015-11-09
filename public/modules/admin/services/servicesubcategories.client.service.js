'use strict';

angular.module('admin').factory('ServiceSubcategories',
	function($resource) {
		return $resource('servicesubcategories/:servicesubcategoryId', { servicesubcategoryId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	});