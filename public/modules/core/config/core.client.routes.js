'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider', /*ServiceSubcategoriesKeywords',*/
	function($stateProvider, $urlRouterProvider /*, ServiceSubcategoriesKeywords*/) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html',
			resolve:
			{

				// Setting the key value to a string will reference a service (which is actually declared as factory)
				// with the specified name	(in this case, the service named 'ServiceSubcategoriesKeywords' will be used.
				// See /api/services/api.staticdata.client.service.js
				// See also: http://www.bennadel.com/blog/2782-route-resolution-using-factory-functions-vs-services-in-angularjs.htm
				// and https://github.com/angular-ui/ui-router/wiki#resolve
				serviceSubcategoriesKeywords: 'ServiceSubcategoriesKeywords'
				// The service method returns a promise that will be resolved with the value of the service response.
				// Once resolved, the service response should be available from the controller, by injecting 'serviceSubcategoriesKeywords'.
				// Subsequent visits to this route should use the service cached and the promise value that was resolved the first
				// time, so the service call won't be triggered again.

			},
			controller: 'HomeController'
		});
	}
]);