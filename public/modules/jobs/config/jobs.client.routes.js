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
					JobStatuses: function(JobStatus) {
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
				templateUrl: 'modules/jobs/views/job-detail.client.view.html',
				// NOTE: controller declaration is needed here, so as the resolve on parent '/jobs' status works.
				// data-ng-controller attribute also needs to be removed from the associated view file.
				controller: 'UserJobDetailsAndEditController'
			}).
			state('jobs.create', {
				url: '/create/:servicesupplierId',
				templateUrl: 'modules/jobs/views/job-create.client.view.html',
				controller: 'UserJobCreateController'
			}).
			state('jobs.edit', {
				url: '/edit/:jobId',
				templateUrl: 'modules/jobs/views/job-edit.client.view.html',
				controller: 'UserJobDetailsAndEditController'
			});
	});
