'use strict';

// Setting up route
angular.module('jobs').config(
	function($stateProvider) {

		$stateProvider.
			state('jobs', {
				url: '/jobs',
				templateUrl: 'modules/jobs/views/jobs.client.view.html',
				controller: 'UserJobsController',
				resolve: {
					JobStatuses: function (JobStatus) {
						return JobStatus.query().$promise;
					}
				}
			}).
			state('jobs.list', {
				url: '/list/:status/:currentPage',
				templateUrl: 'modules/jobs/views/job-list.client.view.html'
			}).
			state('jobs.viewDetail', {
				url: '/detail/:jobId',
				templateUrl: 'modules/jobs/views/job-detail.client.view.html'//,
			}).
			state('jobs.create', {
				url: '/create/:servicesupplierId',
				templateUrl: 'modules/jobs/views/job-create.client.view.html'//,
			}).
			state('jobs.edit', {
				url: '/edit/:jobId',
				templateUrl: 'modules/jobs/views/job-edit.client.view.html'//,
			});
	});
