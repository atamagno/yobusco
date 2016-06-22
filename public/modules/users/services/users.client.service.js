'use strict';

angular.module('users')
	.factory('Users',
		function($resource) {
			return $resource('users', {}, {
				update: {
					method: 'PUT'
				}
			});
		})
	.factory('UserSearch',
		function($resource) {
			return $resource('user-by-username/:userName');
		});