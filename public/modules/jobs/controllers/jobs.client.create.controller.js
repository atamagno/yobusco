'use strict';

// UserJobs controller
// TODO: we should probably merge ServiceSuppliers and ServiceSuppliersDetails into a single service.
angular.module('jobs').controller('UserJobCreateController',
	function($scope, $stateParams, $state, Jobs, ServiceSuppliers, ServiceSuppliersDetails,
			 Alerts, $uibModal, UserSearch) {

		// Getting statuses that can be used to create a job.
		$scope.initialjobstatuses = [];
		$scope.status = {name: '[Seleccione un estado]'};
		for(var i = 0;i<$scope.jobstatuses.length;i++){
			if($scope.jobstatuses[i].initial){
				$scope.initialjobstatuses.push($scope.jobstatuses[i]);
			}
		}

		if($stateParams.servicesupplierId){
			// TODO: maybe we can pass the service supplier object if we come from the supplier details view?
			// Instead of getting an id and searching for it again. We may have all info required to display
			// on the job create view, already on the supplier object from supplier details view..
			$scope.selectedServiceSupplier = ServiceSuppliers.get({servicesupplierId: $stateParams.servicesupplierId})
				.$promise.then(function(servicesupplier){
					$scope.selectedServiceSupplier = servicesupplier;
					$scope.servicesubcategories = $scope.selectedServiceSupplier.services;
				});
		}
		else{
			if($scope.isServiceSupplier){
				ServiceSuppliersDetails.byUserId.query({
					userId: $scope.authentication.user._id
				}).$promise.then(function (servicesupplier) {
						$scope.selectedServiceSupplier = servicesupplier;
						$scope.servicesubcategories = $scope.selectedServiceSupplier.services;
				});
			}
		}

		$scope.searchServiceSupplierByUsername = function(){

			if($scope.selectedServiceSupplierUserName){

				ServiceSuppliersDetails.byUsername.query({
					userName: $scope.selectedServiceSupplierUserName
				}).$promise.then(function (servicesupplier) {
						if(servicesupplier._id){
							$scope.selectedServiceSupplier = servicesupplier;
							$scope.servicesubcategories = $scope.selectedServiceSupplier.services;
						}
						else {
							Alerts.show('danger', 'El prestador de servicios no existe');
						}

					});

			}

		};

		$scope.clearServiceSupplier = function(){
			$scope.selectedServiceSupplier = '';
			$scope.servicesubcategories.splice(0,$scope.servicesubcategories.length)
			$scope.selectedservices.splice(0,$scope.selectedservices.length);
			$scope.selectedservice = '';
		};


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

			// TODO: add validations like Agus is doing on user signup
			// TODO: perform all validations prior to building the job object...
			if($scope.isServiceSupplier){
				if(!$scope.selectedUserName){
					Alerts.show('danger', 'Debes ingresar el nombre de usuario de un cliente');
					return;
				}
			}

			if ($scope.selectedServiceSupplier && $scope.selectedServiceSupplier._id) {

				// TODO: add validation for selected services here.
				// like Agus is doing on user signup
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

				if(reviewinfo){job.review = [reviewinfo];}

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
				Alerts.show('danger', 'Debes ingresar un prestador de servicios valido');
			}
		};

		function saveJob(job){

			// Redirect after save
			job.$save(function(){
				$state.go('jobs.viewDetail', {jobId: job._id});

				// Clear form fields
				// $scope.selectedservices = '';
				$scope.clearServiceSupplier();
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

