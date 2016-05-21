'use strict';

// UserJobs controller
angular.module('jobs').controller('UserJobCreateController',
	function($scope, $stateParams, $state, Jobs, ServiceSuppliers, Alerts) {

		// This may affect the creation of a job from outside a supplier (we're relying on a servicesupplierId state param)
		// - but we might be able to get rid of it for rel 1.
		$scope.selectedServiceSupplier = ServiceSuppliers.get({servicesupplierId: $stateParams.servicesupplierId})
										 .$promise.then(function(servicesupplier){
			$scope.selectedServiceSupplier = servicesupplier;
			$scope.servicesubcategories = $scope.selectedServiceSupplier.services;
		});


		// Create new Job
		$scope.create = function () {

			if ($scope.selectedServiceSupplier && $scope.selectedServiceSupplier._id) {
				// TODO: add validation for selected services here.
				// Check how angular form validation has been implemented in admin (user search form).
				// adminEnhancements branch...
				var services = [];
				for (var i = 0; i < $scope.selectedservices.length; i++) {
					services.push($scope.selectedservices[i]._id);
				}


				// Create new Job object
				var job = new Jobs({
					name: this.name,
					description: this.description,
					start_date: this.start_date,
					expected_date: this.expected_date,
					status: $scope.defaultStatus._id,
					service_supplier: $scope.selectedServiceSupplier._id,
					services: services
				});

				// Redirect after save
				job.$save(function (job) {

					// NOTE: when transitioning to viewDetail state,
					// this same controller gets instantiated (is there a way to avoid the
					// global functions (e.g.: get service supplier) to be executed?)
					// We probably don't have stateParams.servicesupplierId when transitioning to this state,
					// thus ServiceSuppliers.get returns an empty array (and we get an angular exception)
					// Maybe we need a separate controller for the viewDetail view.
					$state.go('jobs.viewDetail', {jobId: job._id});

					// Clear form fields
					// TODO: do we really need to clear the form fields if we're redirecting to a different state?
					$scope.name = '';
					$scope.description = '';
					$scope.start_date = '';
					$scope.expected_date = '';
					$scope.selectedservices = '';
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
					Alerts.show('danger', $scope.error);
				});

			} else {
				Alerts.show('danger', 'Debes seleccionar un prestador de servicios');
			}
		};

		/*$scope.dateFormats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.dateFormat = $scope.dateFormats[0];
		$scope.today = new Date();
		$scope.start_date = $scope.today;*/

		/*$scope.openStartDatePicker = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.startDateOpened = true;
		};

		$scope.openExpectedDatePicker = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.expectedDateOpened = true;
		};

		$scope.openFinishDatePicker = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.finishDateOpened = true;
		};*/


});

