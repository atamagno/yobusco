'use strict';

angular.module('admin')
	.factory('JobApprovalStatus',
		function($resource) {
			return $resource('jobapprovalstatus', {},
				{
					query: { method: "GET", cache: true, isArray: true }
				});
		});
