'use strict';

angular.module('admin').factory('UsersAdmin',
	function($resource) {
		return $resource('users-admin/:userForAdminId', { userForAdminId: '@_id'}, {
			update: {
				method: 'PUT'
			}
		});
	});