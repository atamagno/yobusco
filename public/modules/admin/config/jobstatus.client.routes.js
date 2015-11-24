'use strict';

//Setting up route
angular.module('admin').config(
	function($stateProvider) {
		// JobStatus state routing
		$stateProvider.
		state('admin.listJobStatus', {
			url: '/jobstatus/list/:currentPage/:itemsPerPage',
			templateUrl: 'modules/admin/views/jobstatus/list-jobstatus.client.view.html'
		}).
		state('admin.createJobStatus', {
			url: '/jobstatus/create',
			templateUrl: 'modules/admin/views/jobstatus/create-jobstatus.client.view.html'
		}).
		state('admin.viewJobStatus', {
			url: '/jobstatus/:jobstatusId',
			templateUrl: 'modules/admin/views/jobstatus/view-jobstatus.client.view.html'
		}).
		state('admin.editJobStatus', {
			url: '/jobstatus/:jobstatusId/edit',
			templateUrl: 'modules/admin/views/jobstatus/edit-jobstatus.client.view.html'
		});
	});