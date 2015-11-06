'use strict';

// ServiceCategories controller
angular.module('users').controller('UsersAdminController',
	function($scope, $stateParams, $state, Authentication, UsersAdmin) {
		$scope.authentication = Authentication;

		// Create new User
		$scope.create = function() {
			// Create new User object
			var user = new UsersAdmin ({
				firstName: this.firstName,
				lastName: this.lastName,
				email: this.email,
				username: this.username,
				password: this.password
			});

			// Redirect after save
			user.$save(function(response) {
				$state.go('admin.viewUser', { userForAdminId: response._id});

				// Clear form fields
				$scope.firstName = '';
				$scope.lastName = '';
				$scope.email = '';
				$scope.username = '';
				$scope.password = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing User
		$scope.remove = function(user) {
			if ( user ) {
				user.$remove();

				for (var i in $scope.users) {
					if ($scope.users [i] === user) {
						$scope.users.splice(i, 1);
					}
				}
			} else {
				$scope.user.$remove(function() {
					$state.go('admin.listUsers');
				});
			}
		};

		// Update existing User
		$scope.update = function() {
			var user = $scope.user;

			user.$update(function() {
				$state.go('admin.viewUser', { userForAdminId: user._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Users
		$scope.find = function() {
			$scope.users = UsersAdmin.query();
		};

		// Find existing User
		$scope.findOne = function() {
			$scope.user = UsersAdmin.get({
				userForAdminId: $stateParams.userForAdminId
			});
		};
	});