'use strict';

//Setting up route
angular.module('admin').config(
	function($stateProvider) {
		// ServiceSubcategories state routing
		$stateProvider.
		state('admin.listServiceSubcategories', {
			url: '/servicesubcategories',
			templateUrl: 'modules/admin/views/servicesubcategories/list-servicesubcategories.client.view.html'
		}).
		state('admin.createServiceSubcategory', {
			url: '/servicesubcategories/create',
			templateUrl: 'modules/admin/views/servicesubcategories/create-servicesubcategory.client.view.html'
		}).
		state('admin.viewServiceSubcategory', {
			url: '/servicesubcategories/:servicesubcategoryId',
			templateUrl: 'modules/admin/views/servicesubcategories/view-servicesubcategory.client.view.html'
		}).
		state('admin.editServiceSubcategory', {
			url: '/servicesubcategories/:servicesubcategoryId/edit',
			templateUrl: 'modules/admin/views/servicesubcategories/edit-servicesubcategory.client.view.html'
		});
	});