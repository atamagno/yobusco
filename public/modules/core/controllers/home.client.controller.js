'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication','serviceSubcategoriesKeywords',
	'ServiceSuppliers', function($scope, Authentication, serviceSubcategoriesKeywords, ServiceSuppliers)
	{
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.serviceSubcategoriesKeywords = serviceSubcategoriesKeywords;

		$scope.searchServiceSuppliers = function ($model)
		{
			ServiceSuppliers.searchBySubcategory($model.serviceSubcategoryId).then(function(serviceSuppliers)
			{
				$scope.serviceSuppliers = serviceSuppliers;
				// TODO: change route to home.results here?

			})

		};
	}
]);