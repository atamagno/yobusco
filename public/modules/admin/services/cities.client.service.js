'use strict';

angular.module('admin')
	.factory('Cities',
		function($resource) {
			return $resource('cities', {},
				{
					query: { method: 'GET', cache: true, isArray: true }
				});
		});