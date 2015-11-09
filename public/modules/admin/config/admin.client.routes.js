'use strict';

// Setting up route
angular.module('admin').config(
	function($stateProvider) {

		$stateProvider.
			state('admin', {
				url: '/admin',
				templateUrl: 'modules/admin/views/home.client.view.html',
			});
	});
