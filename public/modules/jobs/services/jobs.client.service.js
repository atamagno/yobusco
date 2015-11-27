'use strict';

angular.module('jobs')
	.factory('Jobs',
		function($resource) {
			return $resource('jobs/:jobId', { jobId: '@_id'
			}, {
				update: { method: 'PUT' }
			});
		})
	.factory('JobsStatus',
		function($resource) {
			return $resource('jobstatus');
		})
	.factory('JobSearch',
		function($resource) {
			return $resource('jobs-by-user/:userId/:status', { userId: '@_id'});
		})
	.factory('Reviews',
		function($resource) {
			return $resource('reviews/:reviewId', { reviewId: '@_id'});
		})
	.factory('RatingTypes',
		function($resource) {
			return $resource('ratingtypes');
		});