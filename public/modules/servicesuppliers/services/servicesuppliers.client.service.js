'use strict';

angular.module('servicesuppliers')
	.factory('ServiceSuppliersDetails',
		function($resource) {
			return {
				reviews: $resource('reviews-by-servicesupplier/:serviceSupplierId', { serviceSupplierId: '@_id'}),
				jobs: $resource('jobs-by-servicesupplier/:serviceSupplierId', { serviceSupplierId: '@_id'})
			};
		});