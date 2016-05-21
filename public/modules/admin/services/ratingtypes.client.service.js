'use strict';

angular.module('admin')
	.factory('RatingTypes',
		function($resource) {
			return $resource('ratingtypes', {},
				{
					query: {method: 'GET',cache:true, isArray:true}
				});
		})
	.factory('RatingTypesAdmin',
		function($resource) {
			return $resource('ratingtypes-admin/:ratingtypeId/:currentPage/:itemsPerPage', { ratingtypeId: '@_id'
			}, {
				query:  { method: 'GET', isArray: false },
				update: { method: 'PUT' }
			});
		});