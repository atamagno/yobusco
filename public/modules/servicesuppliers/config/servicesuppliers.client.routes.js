'use strict';

// Setting up route
angular.module('servicesuppliers').config(
	function($stateProvider) {

		$stateProvider.
			state('servicesupplier', {
				url: '/servicesuppliers-detail',
				templateUrl: 'modules/servicesuppliers/views/servicesupplier.client.view.html'
			}).
			state('servicesupplier.detail', {
				url: '/:servicesupplierId',
				templateUrl: 'modules/servicesuppliers/views/servicesupplier-detail.client.view.html'
			}).
			state('servicesupplier.jobs', {
				url: '/jobs/:servicesupplierId',
				templateUrl: 'modules/servicesuppliers/views/servicesupplier-jobs.client.view.html'
			}).
			state('servicesupplier.reviews', {
				url: '/reviews/:servicesupplierId',
				templateUrl: 'modules/servicesuppliers/views/servicesupplier-reviews.client.view.html'
			}).
			state('servicesupplier.viewJobDetail', {
				url: '/:servicesupplierId/job-detail/:jobId',
				templateUrl: 'modules/jobs/views/job-detail.client.view.html'
			});
	});
