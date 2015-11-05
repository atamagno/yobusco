'use strict';

//Setting up route
angular.module('servicesubcategories').config(['$stateProvider',
	function($stateProvider) {
		// ServiceSubcategories state routing
		$stateProvider.
		state('admin.listServiceSubcategories', {
			url: '/servicesubcategories',
			templateUrl: 'modules/servicesubcategories/views/list-servicesubcategories.client.view.html'
		}).
		state('admin.createServiceSubcategory', {
			url: '/servicesubcategories/create',
			templateUrl: 'modules/servicesubcategories/views/create-servicesubcategory.client.view.html'
		}).
		state('admin.viewServiceSubcategory', {
			url: '/servicesubcategories/:servicesubcategoryId',
			templateUrl: 'modules/servicesubcategories/views/view-servicesubcategory.client.view.html'
		}).
		state('admin.editServiceSubcategory', {
			url: '/servicesubcategories/:servicesubcategoryId/edit',
			templateUrl: 'modules/servicesubcategories/views/edit-servicesubcategory.client.view.html'
		});
	}
]);