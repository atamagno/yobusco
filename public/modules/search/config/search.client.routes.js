'use strict';

// Setting up route
angular.module('search').config(
	function($stateProvider) {

		$stateProvider.
			state('searchServiceSuppliers', {
				url: '/servicesuppliers-search',
				templateUrl: 'modules/search/views/search-servicesupplier.client.view.html'
			}).
			state('resultsServiceSupplier', {
				url: '/servicesuppliers-results',
				templateUrl: 'modules/search/views/results-servicesupplier.client.view.html'
			}).
			state('resultsServiceSupplier.list', {
				url: '/servicesuppliers-results/:serviceId/:currentPage/:itemsPerPage',
				templateUrl: 'modules/search/views/results-list.client.view.html'
			});
	});
