'use strict';

//Setting up route
angular.module('servicesuppliers').config(
	function($stateProvider) {
		// ServiceSuppliers state routing
		$stateProvider.
			state('admin.listServiceSuppliers', {
				url: '/servicesuppliers',
				templateUrl: 'modules/servicesuppliers/views/list-servicesuppliers.client.view.html'
			}).
			state('admin.createServiceSupplier', {
				url: '/servicesuppliers/create',
				templateUrl: 'modules/servicesuppliers/views/create-servicesupplier.client.view.html'
			}).
			state('admin.viewServiceSupplier', {
				url: '/servicesuppliers/:servicesupplierId',
				templateUrl: 'modules/servicesuppliers/views/view-servicesupplier.client.view.html'
			}).
			state('admin.editServiceSupplier', {
				url: '/servicesuppliers/:servicesupplierId/edit',
				templateUrl: 'modules/servicesuppliers/views/edit-servicesupplier.client.view.html'
			});
	});