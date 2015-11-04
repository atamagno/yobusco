'use strict';

// Setting up route
angular.module('admin').config(
	function($stateProvider) {

		$stateProvider.
			state('adminHome', {
				url: '/admin',
				templateUrl: 'modules/admin/views/home.client.view.html',
			})
			.state('adminHome.users', {
				url: '/users',
				templateUrl: 'modules/admin/views/users.client.view.html',
			})
			.state('adminHome.servicesuppliers', {
				url: '/servicesuppliers',
				templateUrl: 'modules/admin/views/servicesuppliers.client.view.html',
			})
			.state('adminHome.servicecategories', {
				url: '/servicecategories',
				templateUrl: 'modules/admin/views/servicecategories.client.view.html',
			})
			.state('adminHome.servicesubcategories', {
				url: '/servicesubcategories',
				templateUrl: 'modules/admin/views/servicesubcategories.client.view.html',
			});
	});
