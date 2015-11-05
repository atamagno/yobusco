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
				templateUrl: 'modules/admin/views/users.client.view.html',
			})
			.state('admin.servicesuppliers', {
				url: '/servicesuppliers',
				templateUrl: 'modules/admin/views/servicesuppliers.client.view.html',
			})
			.state('admin.servicecategories', {
				url: '/servicecategories',
				templateUrl: 'modules/servicecategories/views/list-servicecategories.client.view.html',
			})
			.state('admin.servicesubcategories', {
				url: '/servicesubcategories',
				templateUrl: 'modules/admin/views/servicesubcategories.client.view.html',
			});
	});
