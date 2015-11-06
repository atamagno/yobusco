'use strict';

//Setting up route
angular.module('servicecategories').config(
	function($stateProvider) {
		// ServiceCategories state routing
		$stateProvider.
		state('admin.listServiceCategories', {
			url: '/servicecategories',
			templateUrl: 'modules/servicecategories/views/list-servicecategories.client.view.html'
		}).
		state('admin.createServiceCategory', {
			url: '/servicecategories/create',
			templateUrl: 'modules/servicecategories/views/create-servicecategory.client.view.html'
		}).
		state('admin.viewServiceCategory', {
			url: '/servicecategories/:servicecategoryId',
			templateUrl: 'modules/servicecategories/views/view-servicecategory.client.view.html'
		}).
		state('admin.editServiceCategory', {
			url: '/servicecategories/:servicecategoryId/edit',
			templateUrl: 'modules/servicecategories/views/edit-servicecategory.client.view.html'
		});
	});