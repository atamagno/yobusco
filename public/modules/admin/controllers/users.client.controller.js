'use strict';

// ServiceCategories controller
angular.module('admin').controller('UsersAdminController',
	function($scope, $stateParams, $state, Authentication, UsersAdmin, $uibModal, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;
		$scope.roles = [];
		$scope.password = '';

		// If user is not signed in then redirect back home
		if (!$scope.authentication.user || ($scope.authentication.user.roles.indexOf('admin') === -1)) $state.go('home');

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $uibModal.open({
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
				$state.go('admin.viewUser', { userId: response._id});

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
			$scope.userInfo.$remove(function() {
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
			var userInfo = $scope.userInfo;
			userInfo.roles = [$scope.role];
			userInfo.password = $scope.password;

			userInfo.$update(function() {
				Alerts.show('success','User successfully updated');
				$state.go('admin.viewUser', { userId: userInfo._id});
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
			UsersAdmin.get({
				userId: $stateParams.userId
			}).$promise.then(function(user) {
				$scope.userInfo = user;
				$scope.role = user.roles.length && user.roles.length === 1 ? user.roles[0] : '';
			});
		};
	});

angular.module('admin').controller('UserModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});