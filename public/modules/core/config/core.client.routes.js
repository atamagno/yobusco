'use strict';

// Setting up route
angular.module('core').config(
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/search/views/search-servicesupplier.client.view.html',
			controller: 'SuppliersSearchController',
			resolve: {
				cities: function(Cities){
					return Cities.query().$promise;
				}
			}
			// TODO: add resolve object with service subcategories, client ip address, etc...
		});
	});