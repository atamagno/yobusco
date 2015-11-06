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
	.factory('UsersAdmin',
		function($resource) {
			return $resource('users-admin/:userForAdminId', { userForAdminId: '@_id'}, {
				update: {
					method: 'PUT'
				}
			});
		});