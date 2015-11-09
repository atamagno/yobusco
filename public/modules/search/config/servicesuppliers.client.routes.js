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
				url: '/servicesuppliers-search/:serviceId/search',
				templateUrl: 'modules/search/views/results-servicesupplier.client.view.html'
			});
	});
