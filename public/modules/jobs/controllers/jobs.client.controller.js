'use strict';

// ServiceSubcategories controller
angular.module('jobs').controller('JobsController',
	function($scope, $stateParams, $state, Authentication, Jobs, JobsStatus, ServiceSuppliers, $modal, Alerts) {
		$scope.authentication = Authentication;
        $scope.jobstatus = JobsStatus.query();
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
					job_status_id: $scope.jobstatus[0]._id,
					service_supplier_id: $scope.selectedServiceSupplier._id
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
	});

angular.module('jobs').controller('JobModalInstanceCtrl',
	function ($scope, $modalInstance) {

		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	});