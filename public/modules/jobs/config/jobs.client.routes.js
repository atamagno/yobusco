'use strict';

// Setting up route
angular.module('jobs').config(
	function($stateProvider) {

		$stateProvider.
			state('jobs', {
				url: '/jobs',
				templateUrl: 'modules/jobs/views/jobs.client.view.html',
			}).
			state('jobs.list', {
				url: '/list/:status',
				templateUrl: 'modules/jobs/views/job-list.client.view.html'
			}).
			state('jobs.viewDetail', {
				url: '/detail/:jobId',
				templateUrl: 'modules/jobs/views/job-detail.client.view.html'
			}).
			state('jobs.create', {
				url: '/create',
				templateUrl: 'modules/jobs/views/create-job.client.view.html'
			});
	});
