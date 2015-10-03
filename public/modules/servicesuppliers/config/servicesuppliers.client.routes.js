'use strict';

// Setting up route
angular.module('servicesuppliers').config(
	function($stateProvider) {

		$stateProvider.
			state('listServiceSuppliers', {
				url: '/servicesuppliers',
				templateUrl: 'modules/servicesuppliers/views/list-servicesuppliers.client.view.html'
			}).
			state('createServiceSupplier', {
				url: '/servicesuppliers/create',
				templateUrl: 'modules/servicesuppliers/views/create-servicesupplier.client.view.html'
			}).
			state('viewServiceSupplier', {
				url: '/servicesuppliers/:servicesupplierId',
				templateUrl: 'modules/servicesuppliers/views/view-servicesupplier.client.view.html'
			}).
			state('editServiceSupplier', {
				url: '/servicesuppliers/:servicesupplierId/edit',
				templateUrl: 'modules/servicesuppliers/views/edit-servicesupplier.client.view.html'
			}).
			state('searchServiceSupplier', {
				url: '/servicesuppliers-search',
				templateUrl: 'modules/servicesuppliers/views/search-servicesupplier.client.view.html'
			}).
			state('resultsServiceSupplier', {
				url: '/servicesuppliers-search/:keyword/search',
				templateUrl: 'modules/servicesuppliers/views/results-servicesupplier.client.view.html'
			}).
			state('detailServiceSupplier', {
				url: '/servicesuppliers-detail/:servicesupplierId',
				templateUrl: 'modules/servicesuppliers/views/detail-servicesupplier.client.view.html'
			});
	});
