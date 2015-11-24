'use strict';

//Setting up route
angular.module('admin').config(
	function($stateProvider) {
		// RatingTypes state routing
		$stateProvider.
		state('admin.listRatingTypes', {
			url: '/ratingtypes/list/:currentPage/:itemsPerPage',
			templateUrl: 'modules/admin/views/ratingtypes/list-ratingtypes.client.view.html'
		}).
		state('admin.createRatingType', {
			url: '/ratingtypes/create',
			templateUrl: 'modules/admin/views/ratingtypes/create-ratingtype.client.view.html'
		}).
		state('admin.viewRatingType', {
			url: '/ratingtypes/:ratingtypeId',
			templateUrl: 'modules/admin/views/ratingtypes/view-ratingtype.client.view.html'
		}).
		state('admin.editRatingType', {
			url: '/ratingtypes/:ratingtypeId/edit',
			templateUrl: 'modules/admin/views/ratingtypes/edit-ratingtype.client.view.html'
		});
	});