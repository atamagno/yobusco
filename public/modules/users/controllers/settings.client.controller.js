'use strict';

angular.module('users').controller('SettingsController',
	function($scope, $http, $location, Users, Upload, Authentication, AmazonS3) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

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

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
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

			} else {
				$scope.submitted = true;
			}
		};

		function updateUser(user) {
			user.$update(function(response) {
				$scope.success = true;
				Authentication.user = response;
			}, function(response) {
				$scope.error = response.data.message;
			});
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	});