'use strict';

angular.module('jobs')
	.factory('JobSearch',
		function($resource) {
			return $resource('jobs-by-user/:jobUserId/:status', { jobUserId: '@_id'});
		});