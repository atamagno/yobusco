'use strict';

// ServiceSubcategories controller
angular.module('servicesubcategories').controller('ServiceSubcategoriesController',
	function($scope, $stateParams, $state, Authentication, ServiceSubcategories, ServiceCategories, $modal, Alerts) {
		$scope.authentication = Authentication;
        $scope.servicecategories = ServiceCategories.query();
		$scope.alerts = Alerts;

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $modal.open({
				templateUrl: templateUrl,
				controller: 'ServiceSubcategoryModalInstanceCtrl'
			});

			return modalInstance;
		};

		$scope.openDeleteModal = function () {

			var modalInstance = $scope.createModalInstance('deleteServiceSubcategoryModal');
			modalInstance.result.then(function () {
				$scope.remove()
			});
		};

		$scope.openEditModal = function () {

			var modalInstance = $scope.createModalInstance('editServiceSubcategoryModal');
			modalInstance.result.then(function () {
				$scope.update()
			});
		};

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
				Alerts.show('success','Service subcategory successfully created');
				$state.go('admin.viewServiceSubcategory', { servicesubcategoryId: response._id});

				// Clear form fields
				$scope.name = '';
				$scope.abbr = '';
				$scope.keywords = '';
                $scope.service_category_id = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Remove existing ServiceSubcategory
		$scope.remove = function(servicesubcategory) {
			$scope.servicesubcategory.$remove(function() {
				Alerts.show('success','Service subcategory successfully deleted');
				$state.go('admin.listServiceSubcategories');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Update existing ServiceSubcategory
		$scope.update = function() {
			var servicesubcategory = $scope.servicesubcategory;

			servicesubcategory.$update(function() {
				Alerts.show('success','Service subcategory successfully updated');
				$state.go('admin.viewServiceSubcategory', { servicesubcategoryId: servicesubcategory._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
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

angular.module('servicesubcategories').controller('ServiceSubcategoryModalInstanceCtrl',
	function ($scope, $modalInstance) {

		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	});