'use strict';

// TODO: pass parameters to controllers (all) in array mode to allow minification...
// UsersAdmin controller
angular.module('admin').controller('UsersAdminController',

    function($scope, $stateParams, $state, Authentication, UsersAdminSearch, UsersAdminUser, $uibModal, Alerts) {

		// Initializing scope variables
		$scope.searchParameter = 'username';
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;
		$scope.roles = [];
		$scope.password = '';

		$scope.currentPage = 1;
		$scope.itemsPerPage = 5;
		$scope.maxPages = 5;
		$scope.showList = false;


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
			var user = new UsersAdminUser ({
				firstName: this.firstName,
				lastName: this.lastName,
				email: this.email,
				username: this.username,
				password: this.password,
				roles: this.roles
			});

			// Redirect after save
			user.$save(function(response) {
				Alerts.show('success','Usuario creado exitosamente');
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
				Alerts.show('success','Usuario eliminado exitosamente');
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
				Alerts.show('success','Usuario eliminado exitosamente');
				$state.go('admin.viewUser', { userId: userInfo._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Find users using different parameters...
		$scope.find = function() {

			$scope.users = undefined;
			$scope.totalItems = undefined;
			$scope.showList = false;

			var userSearchParameters = {};

			// Only adding username parameter if the username option has been selected and a value has been entered.
			// Is the controller being reinitialized on state reload?
			if($scope.searchParameter == 'username' && $scope.searchParameterUsername){
				userSearchParameters.username = $scope.searchParameterUsername;
			}
			else
			{		userSearchParameters.firstname = $scope.searchParameterFirstName,
					userSearchParameters.lastname = $scope.searchParameterLastName,
					userSearchParameters.email = $scope.searchParameterEmail,
					userSearchParameters.city = $scope.searchParameterCity
			}


			$scope.users = UsersAdminSearch.query(userSearchParameters).$promise.then(function (response) {

					if(response.users.length == 0)
					{
						$scope.error = 'No se encontraron resultados.';
						Alerts.show('danger',$scope.error);
					}
					else
					{
						$scope.currentPage = 1;
						$scope.users = response.users;
						$scope.totalItems = $scope.users.length;
						$scope.showList = $scope.totalItems > 0;
					}

				},function(errorResponse) {

					$scope.error = errorResponse.data.message;
					Alerts.show('danger',$scope.error);
				});

		}

		// Find existing User
		$scope.findOne = function() {
			UsersAdminUser.get({
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