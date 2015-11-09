'use strict';

//Setting up route
angular.module('admin').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
			state('admin.listUsers', {
				url: '/users-admin',
				templateUrl: 'modules/admin/views/users/list-users.client.view.html'
			}).
			state('admin.createUser', {
				url: '/users-admin/create',
				templateUrl: 'modules/admin/views/users/create-user.client.view.html'
			}).
			state('admin.viewUser', {
				url: '/users-admin/:userForAdminId',
				templateUrl: 'modules/admin/views/users/view-user.client.view.html'
			}).
			state('admin.editUser', {
				url: '/users-admin/:userForAdminId/edit',
				templateUrl: 'modules/admin/views/users/edit-user.client.view.html'
			});
	}
]);