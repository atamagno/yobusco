'use strict';

// Review controller
angular.module('admin').controller('ReviewsController',
	function($scope, $stateParams, $state, Authentication, ReviewsAdmin, RatingTypes, ServiceSuppliers, ServiceSubcategories, Users, ServiceSuppliersDetails, $uibModal, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;

		// If user is not signed in then redirect back home
		if (!$scope.authentication.user || ($scope.authentication.user.roles.indexOf('admin') === -1)) $state.go('home');

		$scope.ratings = [];
		RatingTypes.query().$promise.then(function (types) {
			for (var i = 0; i < types.length; i++) {
				$scope.ratings.push({ _id: types[i]._id, name: types[i].name, description: types[i].description, rate: 0 });
			}
		});

		$scope.servicesubcategories = ServiceSubcategories.query();
		$scope.selectedservices = [];

		$scope.servicesuppliers = ServiceSuppliers.query();
		$scope.selectedServiceSupplier = undefined;

		$scope.users = Users.query();
		$scope.selectedUser = undefined;

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

		$scope.selectServiceSupplier = function($item) {

			ServiceSuppliersDetails.jobs.query({
				serviceSupplierId: $item._id
			}).$promise.then(function (response) {
				$scope.jobs = response;
				if (!$scope.jobs.length) {
					$scope.selectedJob = undefined;
					$scope.review.job = undefined;
				}
			});
		};

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $uibModal.open({
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

				if ($scope.selectedServiceSupplier && $scope.selectedServiceSupplier._id) {

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
						job: $scope.selectedJob && $scope.selectedJob._id ? $scope.selectedJob._id : null,
						service_supplier: $scope.selectedServiceSupplier._id,
						user: $scope.selectedUser._id,
						comment: $scope.comment,
						services: services,
						ratings: ratings
					});

					// Redirect after save
					review.$save(function (response) {
						Alerts.show('success','Rese\u00f1a creada exitosamente');
						$state.go('admin.viewReview', { reviewId: response._id});
					}, function (errorResponse) {
						$scope.error = errorResponse.data.message;
						Alerts.show('danger', $scope.error);
					});
				} else {
					Alerts.show('danger','Debes seleccionar un prestador de servicios v\u00e1lido');
				}
			} else {
				Alerts.show('danger','Debes seleccionar un usuario v\u00e1lido');
			}
		};

		// Remove existing Review
		$scope.remove = function() {
			$scope.review.$remove(function() {
				Alerts.show('success','Rese\u00f1a eliminada exitosamente');
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
			review.job = review.job && review.job._id ? review.job._id : null;

			review.$update(function() {
				Alerts.show('success','Rese\u00f1a actualizada exitosamente');
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
	function ($scope, $uibModalInstance) {

	$scope.ok = function () {
		$uibModalInstance.close();
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});