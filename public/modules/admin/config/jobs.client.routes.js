'use strict';

//Setting up route
angular.module('admin').config(
	function($stateProvider) {
		// Jobs state routing
		$stateProvider.
		state('admin.listJobs', {
			url: '/jobs/list/:currentPage/:itemsPerPage',
			templateUrl: 'modules/admin/views/jobs/list-jobs.client.view.html'
		}).
		state('admin.createJob', {
			url: '/jobs/create',
			templateUrl: 'modules/admin/views/jobs/create-job.client.view.html'
		}).
		state('admin.viewJob', {
			url: '/jobs/:jobId',
			templateUrl: 'modules/admin/views/jobs/view-job.client.view.html'
		}).
		state('admin.editJob', {
			url: '/jobs/:jobId/edit',
			templateUrl: 'modules/admin/views/jobs/edit-job.client.view.html'
		});
	});