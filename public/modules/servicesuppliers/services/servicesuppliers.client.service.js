'use strict';

angular.module('servicesuppliers')
	.factory('ServiceSuppliersDetails',
		function($resource) {
			return {
				jobs: $resource('jobs-by-servicesupplier/:serviceSupplierId/:currentPage/:itemsPerPage',
					{ serviceSupplierId: '@_id'},
					{
						'query':  { method: 'GET', isArray: false }
					}),
				reviews: $resource('reviews-by-servicesupplier/:serviceSupplierId/:currentPage/:itemsPerPage',
					{ serviceSupplierId: '@_id'},
					{
						'query':  { method: 'GET', isArray: false }
					}),
				byUserId: $resource('servicesupplier-by-user/:userId', { userId: '@_id'},
					{
						'query':  { method: 'GET', isArray: false }
					}),
				byUsername: $resource('servicesupplier-by-username/:userName', { userName: '@userName'},
					{
						'query':  { method: 'GET', isArray: false }
					})
			};
		});