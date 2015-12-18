'use strict';

// ServiceSubcategories controller
angular.module('admin').controller('ServiceSubcategoriesController',
	function($scope, $stateParams, $state, Authentication, ServiceSubcategoriesAdmin, ServiceCategories, $uibModal, Alerts) {
		$scope.authentication = Authentication;
        $scope.servicecategories = ServiceCategories.query();
		$scope.alerts = Alerts;

		// If user is not signed in then redirect back home
		if (!$scope.authentication.user || ($scope.authentication.user.roles.indexOf('admin') === -1)) $state.go('home');

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $uibModal.open({
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
			var servicesubcategory = new ServiceSubcategoriesAdmin ({
				name: this.name,
				abbr: this.abbr,
				keywords: this.keywords,
                service_category_id: this.service_category_id
			});

			// Redirect after save
			servicesubcategory.$save(function(response) {
				Alerts.show('success','Subcategor\u00eda de servicio creada exitosamente');
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
				Alerts.show('success','Subcategor\u00eda de servicio eliminada exitosamente');
				$scope.currentPage = 1;
				$scope.navigateToPage();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Update existing ServiceSubcategory
		$scope.update = function() {
			var servicesubcategory = $scope.servicesubcategory;

			servicesubcategory.$update(function() {
				Alerts.show('success','Subcategor\u00eda de servicio actualizada exitosamente');
				$state.go('admin.viewServiceSubcategory', { servicesubcategoryId: servicesubcategory._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		$scope.itemsPerPage = 5;
		$scope.maxPages = 5;
		$scope.showList = false;

		$scope.navigateToPage = function() {
			$state.go('admin.listServiceSubcategories', {
				currentPage: $scope.currentPage,
				itemsPerPage: $scope.itemsPerPage
			});
		};

		// Find a list of ServiceSubcategories
		$scope.find = function() {
			$scope.servicesubcategories = ServiceSubcategoriesAdmin.query({
				currentPage: $stateParams.currentPage,
				itemsPerPage: $stateParams.itemsPerPage
			}).$promise.then(function (response) {
					$scope.currentPage = $stateParams.currentPage;
					$scope.totalItems = response.totalItems;
					$scope.servicesubcategories = response.servicesubcategories;
					$scope.showList = $scope.totalItems > 0;
				});
		};

		// Find existing ServiceSubcategory
		$scope.findOne = function() {
			$scope.servicesubcategory = ServiceSubcategoriesAdmin.get({
				servicesubcategoryId: $stateParams.servicesubcategoryId
			});
		};
	});

angular.module('admin').controller('ServiceSubcategoryModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});