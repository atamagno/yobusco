angular.module('jobs').controller('UserJobEditController',
	function ($scope, $rootScope, $stateParams, $state, Jobs, $uibModal, Alerts, JobStatusReasonsHelper, JobStatusHelper) {

		$scope.possibleNextStatuses = [];

		// Find existing Job
		$scope.findOne = function () {
			Jobs.get({
				jobId: $stateParams.jobId
			}).$promise.then(function (job) {
					$scope.job = job;
					$scope.jobOriginalStatus = job.status;
					$scope.jobOriginalStatusReason = job.status_reason;
					$scope.isJobInFinishedStatus = isJobInFinishedStatus();
					$scope.possibleNextStatuses = JobStatusHelper.getPossibleNextStatuses($scope.job.status, $scope.authentication.user.roles);
					setJobStatusReasonsFromStatus(job.status);
				});
		};

		function isJobInFinishedStatus() {
			return $scope.job.status.finished || $scope.job.status.post_finished;
		}

		$scope.changeStatus = function (status) {
			$scope.job.status = status;
			setJobStatusReasonsFromStatus(status);
		};

		$scope.changeStatusReason = function(statusReason){
			$scope.job.status_reason = statusReason;
		}

		function setJobStatusReasonsFromStatus(selectedStatus){

			if(selectedStatus._id == $scope.jobOriginalStatus._id){
					$scope.job.status_reason = $scope.jobOriginalStatusReason;
					$scope.statusreasons = $scope.jobOriginalStatusReason ? [$scope.jobOriginalStatusReason] : [];
					$scope.statusreasonsdisabled = true;
			}
			else{
				$scope.statusreasons = JobStatusReasonsHelper.getReasons($scope.jobstatusreasons,selectedStatus,$scope.authentication.user.roles);
				if($scope.statusreasons.length){
					$scope.job.status_reason = {description: '[Seleccione una opcion]'};
				}
				else{
					$scope.job.status_reason = null;
				}
				$scope.statusreasonsdisabled = false;
			}


		}

		$scope.openEditJobModal = function () {

			var modalInstance = $uibModal.open({
				templateUrl: 'editJobByUserModal',
				controller: 'EditJobModalInstanceCtrl'
			});

			modalInstance.result.then(function () {
				$scope.update()
			});
		};


		// Update existing Job
		$scope.update = function () {

			var job = $scope.job;

			if(job.status._id === $scope.jobOriginalStatus._id && $scope.isJobInFinishedStatus){
				Alerts.show('warning', 'Debes seleccionar un estado diferente al actual');
				return;
			}

			if($scope.statusreasons.length && !$scope.job.status_reason._id){
				Alerts.show('danger','Debes seleccionar una opcion de razon del estado');
				return;

			}

			// TODO: is this really needed if service supplier is read only now?
			if (job.service_supplier && job.service_supplier._id) {
				// TODO: we should probably pre-populate finish_date date picker with current date...
				// So we probably don't need this check....and just avoid past date???
				if (job.status.finished && !job.finish_date) {
					Alerts.show('danger', 'Debes seleccionar una fecha de finalizaci\u00f3n');
				} else {
					if(!job.review[0] && (job.status.finished || job.status.post_finished) && !$scope.isServiceSupplier){
						$scope.openReviewModal();
					}
					else {
							job.$update(function () {
							Alerts.show('success', 'Trabajo actualizado exitosamente');
							$state.go('jobs.viewDetail', {jobId: job._id});
						}, function (errorResponse) {
								$scope.error = errorResponse.data.message;
								Alerts.show('danger', $scope.error);
						});
					}

				}

			} else {
				Alerts.show('danger', 'Debes seleccionar un prestador de servicios');
			}
		};

		$scope.openReviewModal = function () {

			var modalInstance = $scope.showReviewModal($scope.job.status);
			modalInstance.result.then(function (reviewinfo) {
				$scope.addReview(reviewinfo)

			});
		};

		$scope.addReview = function (reviewinfo) {

			var job = $scope.job;
			job.review = [reviewinfo];

			job.$update(function(){
				Alerts.show('success', 'Trabajo actualizado exitosamente');
				$state.go('jobs.viewDetail', {jobId: job._id});
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});

		};

	});

angular.module('jobs').controller('EditJobModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});


