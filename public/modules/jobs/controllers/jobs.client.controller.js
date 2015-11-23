'use strict';

// ServiceSubcategories controller
angular.module('jobs').controller('JobsController',
	function($scope, $stateParams, $state, Authentication, Jobs, JobSearch, JobsStatus, ServiceSuppliers, Reviews, $modal, Alerts) {
		$scope.authentication = Authentication;
        $scope.jobstatus = JobsStatus.query().$promise.then(function (statuses) {
			for (var i = 0; i < statuses.length; i++) {
				if (statuses[i].name === 'In Progress') {
					$scope.defaultStatus = statuses[i];
					break;
				}
			}
		});
		$scope.servicesuppliers = ServiceSuppliers.query();
		$scope.selectedServiceSupplier = undefined;
		$scope.alerts = Alerts;

		// Create new Job
		$scope.create = function() {

			if ($scope.selectedServiceSupplier && $scope.selectedServiceSupplier._id) {

				// Create new Job object
				var job = new Jobs({
					name: this.name,
					description: this.description,
					start_date: this.start_date,
					expected_date: this.expected_date,
					status: $scope.defaultStatus._id,
					service_supplier: $scope.selectedServiceSupplier._id
				});

				// Redirect after save
				job.$save(function (response) {
					//Alerts.show('success','Job successfully created');
					$state.go('jobs.list', {jobId: response._id});

					// Clear form fields
					$scope.name = '';
					$scope.description = '';
					$scope.start_date = '';
					$scope.expected_date = '';
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
					Alerts.show('danger', $scope.error);
				});

			} else {
				Alerts.show('danger','You must select a valid service supplier');
			}
		};

		// Find existing Job
		$scope.findOne = function() {
			$scope.job = Jobs.get({
				jobId: $stateParams.jobId
			});
		};

		$scope.dateFormats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.dateFormat = $scope.dateFormats[0];
		$scope.today = new Date();
		$scope.start_date = $scope.today;

		$scope.openStartDatePicker = function($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.startDateOpened = true;
		};

		$scope.openExpectedDatePicker = function($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.expectedDateOpened = true;
		};

		$scope.getAllJobs = function() {
			JobSearch.query({
				userId: $scope.authentication.user._id,
			}).$promise.then(function (response) {
				$scope.jobs = response;
			});
		};

		$scope.addReview = function(reviewInfo) {

			var services = [];
			for (var i = 0; i < reviewInfo.selectedservices.length; i++) {
				services.push(reviewInfo.selectedservices[i]._id);
			}

			var ratings = [];
			for (var i = 0; i < reviewInfo.ratings.length; i++) {
				ratings.push({ type: reviewInfo.ratings[i]._id, rate: reviewInfo.ratings[i].rate });
			}

			// Create new Review object
			var review = new Reviews({
				comment: reviewInfo.comment,
				job: $scope.job._id,
				services: services,
				ratings: ratings
			});

			// Redirect after save
			review.$save(function (response) {
				Alerts.show('success','Review successfully created');
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});

		};

		$scope.openReviewModal = function () {

			var modalInstance = $modal.open({
				templateUrl: 'addReviewModal',
				controller: 'ReviewModalInstanceCtrl',
			});

			modalInstance.result.then(function (reviewInfo) {
				$scope.addReview(reviewInfo)
			});
		};
	});

angular.module('jobs').controller('ReviewModalInstanceCtrl',
	function ($scope, $modalInstance, ServiceSubcategories, RatingTypes) {

		$scope.ratings = [];
		RatingTypes.query().$promise.then(function (types) {
			for (var i = 0; i < types.length; i++) {
				$scope.ratings.push({ _id: types[i]._id, name: types[i].name, description: types[i].description, rate: 0 });
			}
		});
		$scope.servicesubcategories = ServiceSubcategories.query();
		$scope.selectedservices = [];
		$scope.rate = 3;

		$scope.ok = function () {
			var reviewInfo = {
				comment: $scope.comment,
				selectedservices: $scope.selectedservices,
				ratings: $scope.ratings
			};

			$modalInstance.close(reviewInfo);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.selectService = function ($item) {

			var alreadySelected = false;
			for (var i = 0; i < $scope.selectedservices.length; i++) {
				if ($item._id === $scope.selectedservices[i]._id) {
					alreadySelected = true;
					break;
				}
			}

			if (!alreadySelected) {
				$scope.selectedservices.push($item);
			}

			$scope.selected = '';
		};

		$scope.deleteSelectedService = function(index) {
			$scope.selectedservices.splice(index, 1);
		};
	});