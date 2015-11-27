'use strict';

// ServiceCategories controller
angular.module('admin').controller('UsersAdminController',
	function($scope, $stateParams, $state, Authentication, UsersAdmin, $modal, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;
		$scope.roles = [];
		$scope.password = '';

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $modal.open({
				templateUrl: templateUrl,
				controller: 'UserModalInstanceCtrl'
			});

			return modalInstance;
		};

		$scope.openDeleteModal = function () {

			var modalInstance = $scope.createModalInstance('deleteUserModal');
			modalInstance.result.then(function () {
				$scope.remove()
			});
		};

		$scope.openEditModal = function () {

			var modalInstance = $scope.createModalInstance('editUserModal');
			modalInstance.result.then(function () {
				$scope.update()
			});
		};

		// Create new User
		$scope.create = function() {
			// Create new User object
			var user = new UsersAdmin ({
				firstName: this.firstName,
				lastName: this.lastName,
				email: this.email,
				username: this.username,
				password: this.password,
				roles: this.roles
			});

			// Redirect after save
			user.$save(function(response) {
				Alerts.show('success','User successfully created');
				$state.go('admin.viewUser', { userForAdminId: response._id});

				// Clear form fields
				$scope.firstName = '';
				$scope.lastName = '';
				$scope.email = '';
				$scope.username = '';
				$scope.password = '';
				$scope.roles = [];
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Remove existing User
		$scope.remove = function(user) {
			$scope.user.$remove(function() {
				Alerts.show('success','User successfully deleted');
				$scope.currentPage = 1;
				$scope.navigateToPage();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Update existing User
		$scope.update = function() {
			var user = $scope.user;
			user.roles = $scope.roles;
			user.password = $scope.password;

			user.$update(function() {
				Alerts.show('success','User successfully updated');
				$state.go('admin.viewUser', { userForAdminId: user._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		$scope.itemsPerPage = 5;
		$scope.maxPages = 5;
		$scope.showList = false;

		$scope.navigateToPage = function() {
			$state.go('admin.listUsers', {
				currentPage: $scope.currentPage,
				itemsPerPage: $scope.itemsPerPage
			});
		};

		// Find a list of Users
		$scope.find = function() {
			$scope.users = UsersAdmin.query({
				currentPage: $stateParams.currentPage,
				itemsPerPage: $stateParams.itemsPerPage
			}).$promise.then(function (response) {
					$scope.currentPage = $stateParams.currentPage;
					$scope.totalItems = response.totalItems;
					$scope.users = response.users;
					$scope.showList = $scope.totalItems > 0;
				});
		};

		// Find existing User
		$scope.findOne = function() {
			$scope.user = UsersAdmin.get({
				userForAdminId: $stateParams.userForAdminId
			});
		};
	});

angular.module('admin').controller('UserModalInstanceCtrl',
	function ($scope, $modalInstance) {

		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	});