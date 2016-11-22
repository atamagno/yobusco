'use strict';

angular.module('core').controller('HeaderController',
	function($scope, $state, Authentication, Menus, MessageSearch, ServiceSubcategoriesKeywords, Cities) {

		$scope.state = $state;
		$scope.serviceSubcategoriesKeywords = ServiceSubcategoriesKeywords;
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		if ($scope.authentication.user)
		{
			MessageSearch.unreadMessages.query({
				userId: $scope.authentication.user._id
			}).$promise.then(function (response) {
				$scope.newMessages = response.unreadCount;
			});
		}

		Cities.query().$promise.then(function (cities) {
			$scope.cities = cities;
			$scope.defaultLocation = cities[0];
		});

		$scope.$on('updateUnread', function(event, unreadMessages) {
			$scope.newMessages = unreadMessages;
		});

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.navigateToResultsFromKeywordSearch = function() {
			if ($scope.selectedKeyword && $scope.selectedKeyword.serviceSubcategoryId) {
				$scope.serviceSubcategoryId = $scope.selectedKeyword.serviceSubcategoryId;

				$scope.selectedKeyword = '';
				$state.go('resultsServiceSupplier.list', {
					serviceId: $scope.serviceSubcategoryId,
					cityId: $scope.defaultLocation._id,
					currentPage: 1,
					itemsPerPage: 5
				});
			}
		};

		$scope.$on('$locationChangeStart',function(evt, absNewUrl, absOldUrl) {

			var hashIndex = absOldUrl.indexOf('#');

			var oldRoute = absOldUrl.substr(hashIndex + 2);

			History.lastRoute = oldRoute;
		});
	});