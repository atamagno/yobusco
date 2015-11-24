'use strict';

// Review controller
angular.module('admin').controller('ReviewsController',
	function($scope, $stateParams, $state, Authentication, ReviewsAdmin, RatingTypes, ServiceSubcategories, Users, Jobs, $modal, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;

		$scope.ratings = [];
		RatingTypes.query().$promise.then(function (types) {
			for (var i = 0; i < types.length; i++) {
				$scope.ratings.push({ _id: types[i]._id, name: types[i].name, description: types[i].description, rate: 0 });
			}
		});

		$scope.servicesubcategories = ServiceSubcategories.query();
		$scope.selectedservices = [];

		$scope.users = Users.query();
		$scope.selectedUser = undefined;

		$scope.jobs = Jobs.query();
		$scope.selectedJob = undefined;

		$scope.selectService = function ($item, selectedservices) {

			var alreadySelected = false;
			for (var i = 0; i < selectedservices.length; i++) {
				if ($item._id === selectedservices[i]._id) {
					alreadySelected = true;
					break;
				}
			}

			if (!alreadySelected) {
				selectedservices.push($item);
			}

			$scope.selected = '';
		};

		$scope.deleteSelectedService = function(index, selectedservices) {
			selectedservices.splice(index, 1);
		};

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $modal.open({
				templateUrl: templateUrl,
				controller: 'ReviewModalInstanceCtrl'
			});

			return modalInstance;
		};

		$scope.openDeleteModal = function () {

			var modalInstance = $scope.createModalInstance('deleteReviewModal');
			modalInstance.result.then(function () {
				$scope.remove()
			});
		};

		$scope.openEditModal = function () {

			var modalInstance = $scope.createModalInstance('editReviewModal');
			modalInstance.result.then(function () {
				$scope.update()
			});
		};

		// Create new Review
		$scope.create = function() {

			if ($scope.selectedUser && $scope.selectedUser._id) {

				if ($scope.selectedJob && $scope.selectedJob._id) {

					var services = [];
					for (var i = 0; i < $scope.selectedservices.length; i++) {
						services.push($scope.selectedservices[i]._id);
					}

					var ratings = [];
					for (var i = 0; i < $scope.ratings.length; i++) {
						ratings.push({ type: $scope.ratings[i]._id, rate: $scope.ratings[i].rate });
					}

					// Create new Review object
					var review = new ReviewsAdmin({
						job: $scope.selectedJob._id,
						user: $scope.selectedUser._id,
						comment: $scope.comment,
						services: services,
						ratings: ratings
					});

					// Redirect after save
					review.$save(function (response) {
						Alerts.show('success','Review successfully created');
						$state.go('admin.viewReview', { reviewId: response._id});
					}, function (errorResponse) {
						$scope.error = errorResponse.data.message;
						Alerts.show('danger', $scope.error);
					});
				} else {
					Alerts.show('danger','You must select a valid job');
				}
			} else {
				Alerts.show('danger','You must select a valid user');
			}
		};

		// Remove existing Review
		$scope.remove = function() {
			$scope.review.$remove(function() {
				Alerts.show('success','Review successfully deleted');
				$scope.currentPage = 1;
				$scope.navigateToPage();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Update existing Review
		$scope.update = function() {
			var review = $scope.review;

			review.$update(function() {
				Alerts.show('success','Review successfully updated');
				$state.go('admin.viewReview', { reviewId: review._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		$scope.itemsPerPage = 5;
		$scope.maxPages = 5;
		$scope.showList = false;

		$scope.navigateToPage = function() {
			$state.go('admin.listReviews', {
				currentPage: $scope.currentPage,
				itemsPerPage: $scope.itemsPerPage
			});
		};

		// Find a list of Reviews
		$scope.find = function() {
			$scope.review = ReviewsAdmin.query({
				currentPage: $stateParams.currentPage,
				itemsPerPage: $stateParams.itemsPerPage
			}).$promise.then(function (response) {
					$scope.currentPage = $stateParams.currentPage;
					$scope.totalItems = response.totalItems;
					$scope.reviews = response.reviews;
					$scope.showList = $scope.totalItems > 0;
				});
		};

		// Find existing Review
		$scope.findOne = function() {
			$scope.review = ReviewsAdmin.get({
				reviewId: $stateParams.reviewId
			});
		};
	});

angular.module('admin').controller('ReviewModalInstanceCtrl',
	function ($scope, $modalInstance) {

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});