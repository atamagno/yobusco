'use strict';

//Setting up route
angular.module('admin').config(
	function($stateProvider) {
		// ServiceSuppliers state routing
		$stateProvider.
			state('admin.listServiceSuppliers', {
				url: '/servicesuppliers',
				templateUrl: 'modules/admin/views/servicesuppliers/list-servicesuppliers.client.view.html'
			}).
			state('admin.createServiceSupplier', {
				url: '/servicesuppliers/create',
				templateUrl: 'modules/admin/views/servicesuppliers/create-servicesupplier.client.view.html'
			}).
			state('admin.viewServiceSupplier', {
				url: '/servicesuppliers/:servicesupplierId',
				templateUrl: 'modules/admin/views/servicesuppliers/view-servicesupplier.client.view.html'
			}).
			state('admin.editServiceSupplier', {
				url: '/servicesuppliers/:servicesupplierId/edit',
				templateUrl: 'modules/admin/views/servicesuppliers/edit-servicesupplier.client.view.html'
			});
	});