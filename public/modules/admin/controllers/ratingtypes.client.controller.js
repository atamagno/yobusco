'use strict';

// RatingType controller
angular.module('admin').controller('RatingTypesController',
	function($scope, $stateParams, $state, Authentication, RatingTypesAdmin, $uibModal, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;

		// If user is not signed in then redirect back home
		if (!$scope.authentication.user || ($scope.authentication.user.roles.indexOf('admin') === -1)) $state.go('home');

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $uibModal.open({
				templateUrl: templateUrl,
				controller: 'RatingTypeModalInstanceCtrl'
			});

			return modalInstance;
		};

		$scope.openDeleteModal = function () {

			var modalInstance = $scope.createModalInstance('deleteRatingTypeModal');
			modalInstance.result.then(function () {
				$scope.remove()
			});
		};

		$scope.openEditModal = function () {

			var modalInstance = $scope.createModalInstance('editRatingTypeModal');
			modalInstance.result.then(function () {
				$scope.update()
			});
		};

		// Create new RatingType
		$scope.create = function() {
			// Create new RatingType object
			var ratingtype = new RatingTypesAdmin ({
				name: this.name,
				description: this.description
			});

			// Redirect after save
			ratingtype.$save(function(response) {
				Alerts.show('success','Tipo de rating creado exitosamente');
				$state.go('admin.viewRatingType', { ratingtypeId: response._id});

				// Clear form fields
				$scope.name = '';
				$scope.description = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Remove existing RatingType
		$scope.remove = function() {
			$scope.ratingtype.$remove(function() {
				Alerts.show('success','Tipo de rating eliminado exitosamente');
				$scope.currentPage = 1;
				$scope.navigateToPage();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Update existing RatingType
		$scope.update = function() {
			var ratingtype = $scope.ratingtype;

			ratingtype.$update(function() {
				Alerts.show('success','Tipo de rating actualizado exitosamente');
				$state.go('admin.viewRatingType', { ratingtypeId: ratingtype._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		$scope.itemsPerPage = 5;
		$scope.maxPages = 5;
		$scope.showList = false;

		$scope.navigateToPage = function() {
			$state.go('admin.listRatingTypes', {
				currentPage: $scope.currentPage,
				itemsPerPage: $scope.itemsPerPage
			});
		};

		// Find a list of RatingType
		$scope.find = function() {
			$scope.ratingtype = RatingTypesAdmin.query({
				currentPage: $stateParams.currentPage,
				itemsPerPage: $stateParams.itemsPerPage
			}).$promise.then(function (response) {
					$scope.currentPage = $stateParams.currentPage;
					$scope.totalItems = response.totalItems;
					$scope.ratingtypes = response.ratingtypes;
					$scope.showList = $scope.totalItems > 0;
				});
		};

		// Find existing RatingType
		$scope.findOne = function() {
			$scope.ratingtype = RatingTypesAdmin.get({
				ratingtypeId: $stateParams.ratingtypeId
			});
		};
	});

angular.module('admin').controller('RatingTypeModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

	$scope.ok = function () {
		$uibModalInstance.close();
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});