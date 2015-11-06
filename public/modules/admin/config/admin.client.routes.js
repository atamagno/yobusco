'use strict';

// Setting up route
angular.module('admin').config(
	function($stateProvider) {

		$stateProvider.
			state('admin', {
				url: '/admin',
				templateUrl: 'modules/admin/views/home.client.view.html',
			})
			.state('admin.users', {
				url: '/users',
				templateUrl: 'modules/users/views/list-users.client.view.html',
			})
			.state('admin.servicesuppliers', {
				url: '/servicesuppliers',
				templateUrl: 'modules/servicesuppliers/views/list-servicesuppliers.client.view.html',
			})
			.state('admin.servicecategories', {
				url: '/servicecategories',
				templateUrl: 'modules/servicecategories/views/list-servicecategories.client.view.html',
			})
			.state('admin.servicesubcategories', {
				url: '/servicesubcategories',
				templateUrl: 'modules/servicesubcategories/views/list-servicesubcategories.client.view.html',
			});
	});
