'use strict';

// Jobs controller
angular.module('admin').controller('JobsController',
	function($scope, $stateParams, $state, Authentication, JobsAdmin, JobsStatus, ServiceSuppliers, $modal, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;

		JobsStatus.query().$promise.then(function (statuses) {
			for (var i = 0; i < statuses.length; i++) {
				if (statuses[i].name === 'In Progress') {
					$scope.defaultStatus = statuses[i];
					break;
				}
			}

			$scope.jobstatus = statuses;
		});

		$scope.servicesuppliers = ServiceSuppliers.query();
		$scope.selectedServiceSupplier = undefined;

		$scope.createModalInstance = function (templateUrl) {

			var modalInstance = $modal.open({
				templateUrl: templateUrl,
				controller: 'JobsModalInstanceCtrl'
			});

			return modalInstance;
		};

		$scope.openDeleteModal = function () {

			var modalInstance = $scope.createModalInstance('deleteJobModal');
			modalInstance.result.then(function () {
				$scope.remove()
			});
		};

		$scope.openEditModal = function () {

			var modalInstance = $scope.createModalInstance('editJobModal');
			modalInstance.result.then(function () {
				$scope.update()
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

		$scope.openFinishDatePicker = function($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.finishDateOpened = true;
		};

		$scope.changeStatus = function(status) {
			$scope.job.status = status;
		};

		// Create new Job
		$scope.create = function() {

			if ($scope.selectedServiceSupplier && $scope.selectedServiceSupplier._id) {

				// Create new Job object
				var job = new JobsAdmin({
					name: this.name,
					description: this.description,
					start_date: this.start_date,
					expected_date: this.expected_date,
					status: $scope.defaultStatus._id,
					service_supplier: $scope.selectedServiceSupplier._id
				});

				// Redirect after save
				job.$save(function (response) {
					Alerts.show('success','Job successfully created');
					$state.go('admin.viewJob', { jobId: response._id});

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

		// Remove existing Job
		$scope.remove = function() {
			$scope.job.$remove(function() {
				Alerts.show('success','Job successfully deleted');
				$scope.currentPage = 1;
				$scope.navigateToPage();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		// Update existing Job
		$scope.update = function() {
			var job = $scope.job;

			if (job.service_supplier && job.service_supplier._id) {

				job.$update(function() {
					Alerts.show('success','Job successfully updated');
					$state.go('admin.viewJob', { jobId: job._id});
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
					Alerts.show('danger',$scope.error);
				});

			} else {
				Alerts.show('danger','You must select a valid service supplier');
			}
		};

		$scope.itemsPerPage = 5;
		$scope.maxPages = 5;
		$scope.showList = false;

		$scope.navigateToPage = function() {
			$state.go('admin.listJobs', {
				currentPage: $scope.currentPage,
				itemsPerPage: $scope.itemsPerPage
			});
		};

		// Find a list of Job
		$scope.find = function() {
			$scope.jobs = JobsAdmin.query({
				currentPage: $stateParams.currentPage,
				itemsPerPage: $stateParams.itemsPerPage
			}).$promise.then(function (response) {
					$scope.currentPage = $stateParams.currentPage;
					$scope.totalItems = response.totalItems;
					$scope.jobs = response.jobs;
					$scope.showList = $scope.totalItems > 0;
				});
		};

		// Find existing Job
		$scope.findOne = function() {
			$scope.job = JobsAdmin.get({
				jobId: $stateParams.jobId
			});
		};
	});

angular.module('admin').controller('JobsModalInstanceCtrl',
	function ($scope, $modalInstance) {

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});