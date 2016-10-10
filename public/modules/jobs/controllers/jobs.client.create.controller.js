'use strict';

// UserJobs controller
angular.module('jobs').controller('UserJobCreateController',
	function($scope, $stateParams, $state, Jobs, ServiceSuppliers, Alerts, $uibModal, UserSearch) {

		// Getting statuses that can be used to create a job.
		$scope.initialjobstatuses = [];
		$scope.status = {name: '[Seleccione un estado]'};
		for(var i = 0;i<$scope.jobstatuses.length;i++){
			if($scope.jobstatuses[i].initial){
				$scope.initialjobstatuses.push($scope.jobstatuses[i]);
			}
		}

		// This may affect the creation of a job from outside a supplier (we're relying on a servicesupplierId state param)
		// - but we might be able to get rid of it for rel 1.
		$scope.selectedServiceSupplier = ServiceSuppliers.get({servicesupplierId: $stateParams.servicesupplierId})
										 .$promise.then(function(servicesupplier){
			$scope.selectedServiceSupplier = servicesupplier;
			$scope.servicesubcategories = $scope.selectedServiceSupplier.services;
		});


		$scope.changeStatus = function (status) {
			$scope.status = status;
		};

		$scope.openCreateJobModal = function () {

			var modalInstance = $uibModal.open({
				templateUrl: 'createJobModal',
				controller: 'CreateJobModalInstanceCtrl'
			});

			modalInstance.result.then(function () {
				if($scope.status.finished && !$scope.isServiceSupplier){
					var modalInstance = $scope.showReviewModal();
					modalInstance.result.then(function (reviewinfo) {
						$scope.create(reviewinfo);
					});
				}
				else{
					$scope.create();
				}


			});
		};

		// Create new Job
		$scope.create = function (reviewinfo) {

			if ($scope.selectedServiceSupplier && $scope.selectedServiceSupplier._id) {

				// TODO: add validation for selected services here.
				// Check Agus' implementation of mandatory fields for registration and use same approach
				var services = [];
				for (var i = 0; i < $scope.selectedservices.length; i++) {
					services.push($scope.selectedservices[i]._id);
				}

				var job = new Jobs({
					name: this.name,
					description: this.description,
					start_date: this.start_date,
					expected_date: this.expected_date,
					status: $scope.status._id,
					service_supplier: $scope.selectedServiceSupplier._id,
					services: services
				});

				if(reviewinfo){job.review = [reviewinfo]};

				if($scope.isServiceSupplier){
					UserSearch.get({userName: $scope.selectedUserName})
						.$promise.then(function(user){
								if(user._id){
									job.user = user._id;
									saveJob(job);
								}
								else{
									Alerts.show('danger','El usuario no existe.');
								}
						});
				}
				else{
					job.user = $scope.authentication.user._id;
					saveJob(job);
				}

			} else {
				Alerts.show('danger', 'Debes seleccionar un prestador de servicios');
			}
		};

		function saveJob(job){

			// Redirect after save
			job.$save(function(){
				$state.go('jobs.viewDetail', {jobId: job._id});

				// Clear form fields
				$scope.selectedservices = '';
				$scope.name = '';
				$scope.description = '';
				$scope.expected_date = '';
			},  function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});

		}

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

angular.module('jobs').controller('CreateJobModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
});

