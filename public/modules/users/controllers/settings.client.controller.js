'use strict';

angular.module('users').controller('SettingsController',
	function($scope, $http, $state, $location, $uibModal, Users, Upload, Authentication, AmazonS3, Alerts, ServiceSuppliersDetails, ServiceSuppliers) {
		$scope.user = Authentication.user;
		$scope.alerts = Alerts;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.isServiceSupplier = $scope.user.roles.indexOf('servicesupplier') != -1;
		if ($scope.isServiceSupplier) {

			ServiceSuppliersDetails.byUserId.query({
				userId: $scope.user._id,
			}).$promise.then(function (response) {
					$scope.serviceSupplier = response;
				});
		}

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.openUpdateUserModal = function () {

			var modalInstance = $uibModal.open({
				templateUrl: 'updateUserProfileModal',
				controller: 'UpdateProfileModalInstanceCtrl'
			});

			modalInstance.result.then(function () {
				$scope.updateUserProfile();
			});
		};

		// Update user profile
		$scope.updateUserProfile = function() {

			$scope.success = $scope.error = null;
			var user = new Users($scope.user);

			var bucketFolder = 'profile_pictures/';
			if ($scope.picFile) {

				Upload.upload({
					url: AmazonS3.url,
					method: 'POST',
					data: {
						key: bucketFolder + $scope.picFile.name,
						AWSAccessKeyId: AmazonS3.AWSAccessKeyId,
						acl: AmazonS3.acl,
						policy: AmazonS3.policy,
						signature: AmazonS3.signature,
						"Content-Type": $scope.picFile.type != '' ? $scope.picFile.type : 'application/octet-stream',
						filename: $scope.picFile.name,
						file: $scope.picFile
					}
				}).then(function(res){
					user.profile_picture = AmazonS3.bucketUrl + bucketFolder + $scope.picFile.name;
					updateUser(user);
				});
			} else {
				updateUser(user);
			}
		};

		function updateUser(user) {
			user.$update(function(response) {
				Authentication.user = response;

				Alerts.show('success','Perfil actualizado exitosamente');
				$state.go('profile.user');

			}, function(response) {
				$scope.error = response.data.message;
				Alerts.show('danger', $scope.error);
			});
		};

		$scope.openUpdateServiceSupplierModal = function () {

			var modalInstance = $uibModal.open({
				templateUrl: 'updateServiceSupplierProfileModal',
				controller: 'UpdateProfileModalInstanceCtrl'
			});

			modalInstance.result.then(function () {
				$scope.updateServiceSupplierProfile();
			});
		};

		// Update service supplier profile
		$scope.updateServiceSupplierProfile = function() {

			$scope.success = $scope.error = null;

			var serviceSupplier = new ServiceSuppliers($scope.serviceSupplier);
			serviceSupplier.$update(function(serviceSupplier) {
				$scope.serviceSupplier = serviceSupplier;

				$state.go('profile.serviceSupplier');
				Alerts.show('success','Perfil actualizado exitosamente');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Change user password
		$scope.changeUserPassword = function(isValid) {
			$scope.success = $scope.error = null;

			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'passwordForm');

				return false;
			}

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				Alerts.show('success','Contraseña actualizado exitosamente');
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
				Alerts.show('danger',$scope.error);
			});
		};
	});

angular.module('users').controller('UpdateProfileModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});