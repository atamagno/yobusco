'use strict';

// ServiceCategories controller
angular.module('admin').controller('ServiceCategoriesController',
	function($scope, $stateParams, $state, Authentication, ServiceCategoriesAdmin, $uibModal, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;

		// If user is not signed in then redirect back home
		if (!$scope.authentication.user || ($scope.authentication.user.roles.indexOf('admin') === -1)) $state.go('home');

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $uibModal.open({
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
			var servicecategory = new ServiceCategoriesAdmin ({
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
				$scope.currentPage = 1;
				$scope.navigateToPage();
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

		$scope.itemsPerPage = 5;
		$scope.maxPages = 5;
		$scope.showList = false;

		$scope.navigateToPage = function() {
			$state.go('admin.listServiceCategories', {
				currentPage: $scope.currentPage,
				itemsPerPage: $scope.itemsPerPage
			});
		};

		// Find a list of ServiceCategory
		$scope.find = function() {
			$scope.servicecategories = ServiceCategoriesAdmin.query({
				currentPage: $stateParams.currentPage,
				itemsPerPage: $stateParams.itemsPerPage
			}).$promise.then(function (response) {
					$scope.currentPage = $stateParams.currentPage;
					$scope.totalItems = response.totalItems;
					$scope.servicecategories = response.servicecategories;
					$scope.showList = $scope.totalItems > 0;
				});
		};

		// Find existing ServiceCategory
		$scope.findOne = function() {
			$scope.servicecategory = ServiceCategoriesAdmin.get({
				servicecategoryId: $stateParams.servicecategoryId
			});
		};
	});

angular.module('admin').controller('ServiceCategoryModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

	$scope.ok = function () {
		$uibModalInstance.close();
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});