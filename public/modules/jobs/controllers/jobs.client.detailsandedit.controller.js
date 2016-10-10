angular.module('jobs').controller('UserJobDetailsAndEditController',
	function ($scope, $rootScope, $stateParams, $state, Jobs, $uibModal, Alerts) {

		$scope.possibleNextStatuses = [];

		// Find existing Job
		$scope.findOne = function () {
			Jobs.get({
				jobId: $stateParams.jobId
			}).$promise.then(function (job) {
					$scope.job = job;
					$scope.possibleNextStatuses.push(job.status);
					$scope.possibleNextStatuses = $scope.possibleNextStatuses.concat(job.status.possible_next_statuses);
				});
		};

		$scope.changeStatus = function (status) {
			$scope.job.status = status;
		};

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

			if (job.service_supplier && job.service_supplier._id) {
				// TODO: we should probably pre-populate finish_date date picker with current date...
				// So we probably don't need this check....Avoid past date???
				if (job.status.finished && !job.finish_date) {
					Alerts.show('danger', 'Debes seleccionar una fecha de finalizaci\u00f3n');
				} else {
					if(!job.review[0] && job.status.finished && !$scope.isServiceSupplier) {
						$scope.openReviewModal();
					}
					else {
						job.$update(function () {
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

			var modalInstance = $scope.showReviewModal();
			modalInstance.result.then(function (reviewinfo) {
				$scope.addReview(reviewinfo)

			});
		};

		$scope.addReview = function (reviewinfo) {

			var job = $scope.job;
			job.review = [reviewinfo];

			job.$update(function(){
				$state.go('jobs.viewDetail', {jobId: job._id});
			}, function (errorResponse) {

				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});

		};

		$scope.addImages = function (imagePaths) {

			var job = $scope.job;
			for (var i = 0; i < imagePaths.length; i++) {
				if (job.pictures.indexOf(imagePaths[i]) === -1) {
					job.pictures.push(imagePaths[i]);
				}
			}

			job.$update(function () {
				Alerts.show('success', 'Trabajo actualizado exitosamente');
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});
		};

		$scope.deleteImage = function (image) {

			var job = $scope.job, index = job.pictures.indexOf(image);
			if (index > -1) {
				job.pictures.splice(index, 1);
			}

			job.$update(function () {
				Alerts.show('success', 'Imagen eliminada exitosamente');
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});
		};

		$scope.openUploadImagesModal = function () {

			var modalInstance = $uibModal.open({
				templateUrl: 'addJobImagesModal',
				controller: 'AddJobImagesModalInstanceCtrl',
				resolve: {
					job: function () {
						return $scope.job;
					}
				}
			});

			modalInstance.result.then(function (imagePaths) {
				$scope.addImages(imagePaths)
			});
		};

		$scope.openImageModal = function (image) {

			var modalInstance = $uibModal.open({
				templateUrl: 'openImageModal',
				controller: 'OpenImagesModalInstanceCtrl',
				resolve: {
					image: function () {
						return image;
					}
				}
			});

			modalInstance.result.then(function (image) {
				$scope.deleteImage(image)
			});
		}

		$scope.openApproveRejectJobModal = function(approvalAction) {

			$scope.approvalAction = approvalAction;
			var approveRejectModalInstance = $uibModal.open({
				templateUrl: 'approveRejectJobModal',
				controller: 'ApproveRejectJobModalInstanceCtrl',
				scope: $scope
			});

			approveRejectModalInstance.result.then(function (challengeDetails) {
				if((!$scope.isServiceSupplier && !$scope.job.review[0]) &&
				   (($scope.approvalAction == 'approved' && $scope.job.target_status.finished) ||
				   ($scope.approvalAction == 'rejected' && challengeDetails.status.finished))){
						var modalInstance = $scope.showReviewModal();
						modalInstance.result.then(function (reviewInfo) {
							$scope.approveRejectJob(approvalAction,challengeDetails, reviewInfo);
						});
				}
				else{
					$scope.approveRejectJob(approvalAction,challengeDetails);
				}
			});
		};

		$scope.approveRejectJob = function(approvalAction, challengeDetails, reviewInfo) {

			var job = new Jobs();
			job._id = $scope.job._id;
			job.update_action = 'approval';

			if(approvalAction == 'approved'){
				job.approval = true;
			}
			else{
				challengeDetails.status = challengeDetails.status._id;
				job.approval_challenge_details = challengeDetails;
				job.approval = false;
			}

			if(reviewInfo) {job.approval_review = reviewInfo;}

			job.$update(function() {
					if (approvalAction == 'approved') {
						Alerts.show('success', 'Trabajo aprobado exitosamente');
					}
					else {
						Alerts.show('success', 'El estado del trabajo ser&#225; resuelto por un administrador del sistema \n' +
						'Ser&#225;s contactado en caso de que se requiera mas informaci&#243;n.');
					}
					$state.reload();
				},function(errorResponse) {
							$scope.error = errorResponse.data.message;
							Alerts.show('danger',$scope.error);
				});
		};

		$scope.openResolveJobModal = function(resolveAction) {

			$scope.resolveAction = resolveAction;
			var modalInstance = $uibModal.open({
				templateUrl: 'resolveJobModal',
				controller: 'ResolveJobModalInstanceCtrl',
				scope: $scope
			});

			modalInstance.result.then(function () {
				$scope.resolveJob($scope.resolveAction);
			});
		};

		$scope.resolveJob = function(resolveAction) {

			var job = new Jobs();
			job._id = $scope.job._id;
			job.update_action = 'resolution';
			job.resolution = resolveAction;

			job.$update(function() {
					Alerts.show('success','Trabajo actualizado exitosamente');
					$state.reload();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};



	});

angular.module('jobs').controller('AddJobImagesModalInstanceCtrl',
	function ($scope, $uibModalInstance, Upload, AmazonS3, job) {

		$scope.uploadFiles = function(files) {
			$scope.files = files;
			var uploads = [], imagePaths = [], bucketFolder = 'job_pictures/' + job._id + '/';
			angular.forEach(files, function(file, index) {
				var imageName = job.pictures.length + index, imagePath = AmazonS3.bucketUrl + bucketFolder + imageName;
				imagePaths.push(imagePath);
				file.upload = Upload.upload({
					url: AmazonS3.url,
					method: 'POST',
					data: {
						key: bucketFolder + imageName,
						AWSAccessKeyId: AmazonS3.AWSAccessKeyId,
						acl: AmazonS3.acl,
						policy: AmazonS3.policy,
						signature: AmazonS3.signature,
						"Content-Type": file.type != '' ? file.type : 'application/octet-stream',
						filename: imageName,
						file: file
					}
				});

				file.upload.then(function (response) {
					if (uploads.length === files.length) {
						$uibModalInstance.close(imagePaths);
					}
				}, function (response) {
					if (response.status > 0) {
						$scope.errorMsg = response.status + ': ' + response.data;
					}
				}, function (evt) {
					file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
					if (file.progress === 100 && uploads.indexOf(file.name) === -1) {
						uploads.push(file.name);
					}
				});
			});
		}

		$scope.cancel = function () {

			angular.forEach($scope.files, function(file) {
				if (file.upload && file.progress !== 100) {
					file.upload.abort();
				}
			});

			$uibModalInstance.dismiss('cancel');
		};
	});

angular.module('jobs').controller('OpenImagesModalInstanceCtrl',
	function ($scope, $uibModalInstance, image) {

		$scope.image = image;

		$scope.delete = function () {
			$uibModalInstance.close(image);
		};

		$scope.close = function () {
			$uibModalInstance.dismiss('cancel');
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


angular.module('jobs').controller('ApproveRejectJobModalInstanceCtrl',
	function ($scope, $uibModalInstance, Alerts) {

		if($scope.approvalAction == 'approved'){
			$scope.approvalActionString = 'aprobar';
		}
		else
		{
			$scope.approvalActionString = 'rechazar';
			$scope.possiblechallengestatuses = getChallengeStatuses($scope.job);
			$scope.challengestatus = {name: '[Seleccione un estado]'};
		}

		$scope.ok = function () {

			if($scope.approvalAction == 'rejected')
			{
				if(!$scope.challengestatus._id){
					Alerts.show('danger', 'Debes seleccionar un estado');
				}
				else{
					$uibModalInstance.close({status: $scope.challengestatus,
											 comments: $scope.challengecomment});
				}
			}
			else{
				$uibModalInstance.close();
			}

		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};

		function getChallengeStatuses(job){

			var possible_next_statuses = job.status.possible_next_statuses;
			var possiblechallengestatuses = job.status.keyword == 'created' ? [] : [job.status];
			for(var i=0;i<possible_next_statuses.length;i++)
			{
				if(possible_next_statuses[i]._id != job.target_status._id){
					possiblechallengestatuses.push(possible_next_statuses[i]);
				}
			}

			return possiblechallengestatuses;
		}

		$scope.changeChallengeStatus = function(status) {
			$scope.challengestatus = status;
		}

	});

angular.module('jobs').controller('ResolveJobModalInstanceCtrl',
	function ($scope, $uibModalInstance, Alerts) {

		var job = $scope.job;
		if($scope.resolveAction == 'target'){
			$scope.resolvedJobStatus = job.target_status.name;
		}
		else
		{
			$scope.resolvedJobStatus = job.approval_challenge_details.status.name;
		}

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};

	});






