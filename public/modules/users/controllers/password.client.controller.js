'use strict';

angular.module('users').controller('PasswordController',
	function($scope, $stateParams, $http, $location, Authentication, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function(isValid) {
			$scope.success = $scope.error = null;

			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

				return false;
			}

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				Alerts.show('success',response.message);

			}).error(function(response) {
				// Show user error message and clear form
				$scope.error = response.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	});