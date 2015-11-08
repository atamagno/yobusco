'use strict';

// ServiceCategories controller
angular.module('servicecategories').controller('ServiceCategoriesController',
	function($scope, $stateParams, $state, Authentication, ServiceCategories, $modal, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $modal.open({
				templateUrl: templateUrl,
				controller: 'ServiceCategoryModalInstanceCtrl'
			});

			return modalInstance;
		};

		$scope.openDeleteModal = function () {

			var modalInstance = $scope.createModalInstance('deleteServiceCategoryModal');
			modalInstance.result.then(function () {
				$scope.remove()
			});
		};

		$scope.openEditModal = function () {

			var modalInstance = $scope.createModalInstance('editServiceCategoryModal');
			modalInstance.result.then(function () {
				$scope.update()
			});
		};

		// Create new ServiceCategory
		$scope.create = function() {
			// Create new ServiceCategory object
			var servicecategory = new ServiceCategories ({
				name: this.name
			});

			// Redirect after save
			servicecategory.$save(function(response) {
				Alerts.show('success','Service category successfully created');
				$state.go('admin.viewServiceCategory', { servicecategoryId: response._id});

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Remove existing ServiceCategory
		$scope.remove = function() {
			$scope.servicecategory.$remove(function() {
				Alerts.show('success','Service category successfully deleted');
				$state.go('admin.listServiceCategories');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Update existing ServiceCategory
		$scope.update = function() {
			var servicecategory = $scope.servicecategory;

			servicecategory.$update(function() {
				Alerts.show('success','Service category successfully updated');
				$state.go('admin.viewServiceCategory', { servicecategoryId: servicecategory._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
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
	});

angular.module('servicecategories').controller('ServiceCategoryModalInstanceCtrl',
	function ($scope, $modalInstance) {

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});