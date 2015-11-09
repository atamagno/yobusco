'use strict';

angular.module('users')
	.factory('Users',
		function($resource) {
			return $resource('users', {}, {
				update: {
					method: 'PUT'
				}
			});
		});