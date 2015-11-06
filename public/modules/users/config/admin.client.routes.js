'use strict';

//Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
			state('admin.listUsers', {
				url: '/users-admin',
				templateUrl: 'modules/users/views/list-users.client.view.html'
			}).
			state('admin.createUser', {
				url: '/users-admin/create',
				templateUrl: 'modules/users/views/create-user.client.view.html'
			}).
			state('admin.viewUser', {
				url: '/users-admin/:userForAdminId',
				templateUrl: 'modules/users/views/view-user.client.view.html'
			}).
			state('admin.editUser', {
				url: '/users-admin/:userForAdminId/edit',
				templateUrl: 'modules/users/views/edit-user.client.view.html'
			});
	}
]);