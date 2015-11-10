'use strict';

// Setting up route
angular.module('servicesuppliers').config(
	function($stateProvider) {

		$stateProvider.
			state('detailServiceSupplier', {
				url: '/servicesuppliers-detail/:servicesupplierId',
				templateUrl: 'modules/servicesuppliers/views/detail-servicesupplier.client.view.html',
				controller: 'ServiceSuppliersDetailController'
			});
	});
