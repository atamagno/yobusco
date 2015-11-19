'use strict';

//Setting up route
angular.module('admin').config(
	function($stateProvider) {
		// ServiceCategories state routing
		$stateProvider.
		state('admin.listServiceCategories', {
			url: '/servicecategories/list/:currentPage/:itemsPerPage',
			templateUrl: 'modules/admin/views/servicecategories/list-servicecategories.client.view.html'
		}).
		state('admin.createServiceCategory', {
			url: '/servicecategories/create',
			templateUrl: 'modules/admin/views/servicecategories/create-servicecategory.client.view.html'
		}).
		state('admin.viewServiceCategory', {
			url: '/servicecategories/:servicecategoryId',
			templateUrl: 'modules/admin/views/servicecategories/view-servicecategory.client.view.html'
		}).
		state('admin.editServiceCategory', {
			url: '/servicecategories/:servicecategoryId/edit',
			templateUrl: 'modules/admin/views/servicecategories/edit-servicecategory.client.view.html'
		});
	});