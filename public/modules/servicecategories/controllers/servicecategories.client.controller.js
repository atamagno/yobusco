'use strict';

// ServiceCategories controller
angular.module('servicecategories').controller('ServiceCategoriesController', ['$scope', '$stateParams', '$state', 'Authentication', 'ServiceCategories',
	function($scope, $stateParams, $state, Authentication, ServiceCategories) {
		$scope.authentication = Authentication;

		// Create new ServiceCategory
		$scope.create = function() {
			// Create new ServiceCategory object
			var servicecategory = new ServiceCategories ({
				name: this.name
			});

			// Redirect after save
			servicecategory.$save(function(response) {
				$state.go('admin.viewServiceCategory', { servicecategoryId: response._id});

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing ServiceCategory
		$scope.remove = function(servicecategory) {
			if ( servicecategory ) { 
				servicecategory.$remove();

				for (var i in $scope.servicecategories) {
					if ($scope.servicecategories [i] === servicecategory) {
						$scope.servicecategories.splice(i, 1);
					}
				}
			} else {
				$scope.servicecategory.$remove(function() {
					$state.go('admin.listServiceCategories');
				});
			}
		};

		// Update existing ServiceCategory
		$scope.update = function() {
			var servicecategory = $scope.servicecategory;

			servicecategory.$update(function() {
				$state.go('admin.viewServiceCategory', { servicecategoryId: servicecategory._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of ServiceCategory
		$scope.find = function() {
			$scope.servicecategories = ServiceCategories.query();
		};

		// Find existing ServiceCategory
		$scope.findOne = function() {
			$scope.servicecategory = ServiceCategories.get({
				servicecategoryId: $stateParams.servicecategoryId
			});
		};
	}
]);