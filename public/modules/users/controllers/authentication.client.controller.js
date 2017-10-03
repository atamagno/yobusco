'use strict';

angular.module('users').controller('AuthenticationController',
	function($scope, $state, $rootScope, $http, $location, $window, Authentication, MessageSearch, Alerts, PasswordValidator, Cities, CitiesHelper) {

	$scope.authentication = Authentication;
		$scope.alerts = Alerts;
		$scope.popoverMsg = PasswordValidator.getPopoverMsg();


        Cities.query().$promise.then(function (cities) {
            $scope.cities = cities;
            $scope.defaultLocation = {name: '[Seleccione una ciudad]'};
        });


		// Get an eventual error defined in the URL query string:
		$scope.error = $location.search().err;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function(isValid) {
			$scope.error = null;

			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'userForm');

				return false;
			}

			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				$scope.authentication.user.city = CitiesHelper.findById($scope.cities,$scope.authentication.user.city);

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
				Alerts.show('danger', $scope.error);
			});
		};

		$scope.signin = function(isValid) {
			$scope.error = null;

			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'userForm');

				return false;
			}

			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
                $scope.authentication.user.city = CitiesHelper.findById($scope.cities,$scope.authentication.user.city);

				MessageSearch.unreadMessages.query({
					userId: $scope.authentication.user._id
				}).$promise.then(function (response) {
					$rootScope.$broadcast('updateUnread', response.unreadCount);
				});

				if (History.lastRoute) {
					$location.path(History.lastRoute);
				} else {
					// Redirect to the index page
					$location.path('/');
				}

			}).error(function(response) {
				$scope.error = response.message;
				Alerts.show('danger', $scope.error);
			});
		};

		// OAuth provider request
		$scope.callOauthProvider = function (url) {
			if (History.lastRoute) {
				url += '?redirect_to=' + encodeURIComponent(History.lastRoute);
			}

			// Effectively call OAuth authentication route:
			$window.location.href = url;
		};

        $scope.changeLocation = function (city) {
            $scope.defaultLocation = city;
            $scope.credentials.city = city._id;
        };

	});