'use strict';

angular.module('servicesuppliers')
	.factory('ServiceSuppliersDetails',
		function($resource) {
			return {
				jobs: $resource('jobs-by-servicesupplier/:serviceSupplierId', { serviceSupplierId: '@_id'}),
				byUserId: $resource('servicesupplier-by-user/:userId', { userId: '@_id'},
					{
						'query':  { method: 'GET', isArray: false }
					})
			};
		});