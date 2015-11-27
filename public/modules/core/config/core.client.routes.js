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
			templateUrl: 'modules/search/views/search-servicesupplier.client.view.html'
		});
	});