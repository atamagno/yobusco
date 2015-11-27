'use strict';

angular.module('admin').factory('UsersAdmin',
	function($resource) {
		return $resource('users-admin/:userForAdminId/:currentPage/:itemsPerPage', { userForAdminId: '@_id'}, {
			query: { method: 'GET', isArray: false },
			update: { method: 'PUT' }
		});
	});