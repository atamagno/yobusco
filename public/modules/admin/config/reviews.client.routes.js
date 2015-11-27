'use strict';

//Setting up route
angular.module('admin').config(
	function($stateProvider) {
		// Reviews state routing
		$stateProvider.
		state('admin.listReviews', {
			url: '/reviews/list/:currentPage/:itemsPerPage',
			templateUrl: 'modules/admin/views/reviews/list-reviews.client.view.html'
		}).
		state('admin.createReview', {
			url: '/reviews/create',
			templateUrl: 'modules/admin/views/reviews/create-review.client.view.html'
		}).
		state('admin.viewReview', {
			url: '/reviews/:reviewId',
			templateUrl: 'modules/admin/views/reviews/view-review.client.view.html'
		}).
		state('admin.editReview', {
			url: '/reviews/:reviewId/edit',
			templateUrl: 'modules/admin/views/reviews/edit-review.client.view.html'
		});
	});