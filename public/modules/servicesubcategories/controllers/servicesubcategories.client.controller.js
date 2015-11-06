'use strict';

// ServiceSubcategories controller
angular.module('servicesubcategories').controller('ServiceSubcategoriesController',
	function($scope, $stateParams, $state, Authentication, ServiceSubcategories, ServiceCategories) {
		$scope.authentication = Authentication;
        $scope.servicecategories = ServiceCategories.query();

		// Create new ServiceSubcategory
		$scope.create = function() {
			// Create new ServiceSubcategory object
			var servicesubcategory = new ServiceSubcategories ({
				name: this.name,
				abbr: this.abbr,
				keywords: this.keywords,
                service_category_id: this.service_category_id
			});

			// Redirect after save
			servicesubcategory.$save(function(response) {
				$state.go('admin.viewServiceSubcategory', { servicesubcategoryId: response._id});

				// Clear form fields
				$scope.name = '';
				$scope.abbr = '';
				$scope.keywords = '';
                $scope.service_category_id = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing ServiceSubcategory
		$scope.remove = function(servicesubcategory) {
			if ( servicesubcategory ) { 
				servicesubcategory.$remove();

				for (var i in $scope.servicesubcategories) {
					if ($scope.servicesubcategories [i] === servicesubcategory) {
						$scope.servicesubcategories.splice(i, 1);
					}
				}
			} else {
				$scope.servicesubcategory.$remove(function() {
					$state.go('admin.listServiceSubcategories');
				});
			}
		};

		// Update existing ServiceSubcategory
		$scope.update = function() {
			var servicesubcategory = $scope.servicesubcategory;

			servicesubcategory.$update(function() {
				$state.go('admin.viewServiceSubcategory', { servicesubcategoryId: servicesubcategory._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of ServiceSubcategories
		$scope.find = function() {
			$scope.servicesubcategories = ServiceSubcategories.query();
		};

		// Find existing ServiceSubcategory
		$scope.findOne = function() {
			$scope.servicesubcategory = ServiceSubcategories.get({
				servicesubcategoryId: $stateParams.servicesubcategoryId
			});
		};
	});