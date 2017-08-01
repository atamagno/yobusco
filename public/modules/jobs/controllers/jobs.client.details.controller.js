angular.module('jobs').controller('UserJobDetailsController',
	function ($scope, $rootScope, $stateParams, $state, Jobs, $uibModal, Alerts) {


		$scope.max = 5;

		// Find existing Job
		$scope.findOne = function () {
			Jobs.get({
				jobId: $stateParams.jobId
			}).$promise.then(function (job) {
					$scope.job = job;
					$scope.isJobInFinishedStatus = isJobInFinishedStatus();
					$scope.isJobInNotHiredStatus = isJobInNotHiredStatus();
					$scope.hasJobNextStatuses = hasJobNextStatuses();
					$scope.hasJobTargetStatusReason = hasJobTargetStatusReason();
					$scope.hasJobStatusReason = hasJobStatusReason();
					$scope.isJobChallengedWithStatusReason = isJobChallengedWithStatusReason();
					$scope.isJobWaitingApproval = isJobWaitingApproval();
					$scope.isJobChallenged = isJobChallenged();
					$scope.isJobApproved = isJobApproved();
					$scope.isJobReviewed = isJobReviewed();
					$scope.isJobParticipant = isJobParticipant();
					$scope.isUserLastUpdater = isUserLastUpdater();
					$scope.isJobUser = isJobUser();
					$scope.isJobApprover = isJobApprover();
					$scope.hasJobPictures = hasJobPictures();
				});
		};

		function hasJobStatusReason(){
			return $scope.job.status_reason;
		}
		function hasJobPictures(){
			return $scope.job.pictures.length;
		}

		function isJobChallenged(){
			return ($scope.job.initial_approval_status.keyword == 'challenged'
					|| ($scope.job.subsequent_approval_status && $scope.job.subsequent_approval_status.keyword == 'challenged'));
		}

		function isJobChallengedWithStatusReason(){
			return (isJobChallenged() && $scope.job.approval_challenge_details.status_reason);

		}

		function isJobApproved(){
			return (($scope.job.initial_approval_status.keyword == 'approved' && !$scope.job.subsequent_approval_status)
				   || ($scope.job.subsequent_approval_status && $scope.job.subsequent_approval_status.keyword == 'approved'));
		}

		function hasJobTargetStatusReason(){
			return $scope.job.target_status_reason;
		}

		function isUserLastUpdater(){

			return ($scope.authentication.user &&
				   ($scope.authentication.user._id === $scope.job.last_updated_by._id));

		}
		function isJobReviewed(){
			return ($scope.job.review.length);

		}

		function isJobUser(){
			return ($scope.authentication.user && $scope.authentication.user._id === $scope.job.user._id);
		}

		function isJobParticipant(){
			return isJobUser() || isJobSupplier();
		}

		function isJobSupplier(){
			return ($scope.authentication.user && $scope.authentication.user._id === $scope.job.service_supplier.user);
		}

		function isJobWaitingApproval(){
			return ($scope.job.initial_approval_status.keyword == 'pending'
					|| ($scope.job.subsequent_approval_status && $scope.job.subsequent_approval_status.keyword == 'pending'));
		}

		function isJobInFinishedStatus() {
			return $scope.job.status.finished || $scope.job.status.post_finished;
		}

		function isJobInNotHiredStatus(){
			return $scope.job.status.keyword == 'nothired';
		}

		function hasJobNextStatuses(){
			return $scope.job.status.possible_next_statuses.length;
		}

		function isJobApprover(){
			return ($scope.authentication.user && $scope.authentication.user._id === $scope.job.approver);
		}

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
				$state.reload();
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});

		};

		$scope.addImages = function (imagePaths) {

			//var job = $scope.job;
			var job = new Jobs();
			job._id = $scope.job._id;
			job.pictures = $scope.job.pictures;

			for (var i = 0; i < imagePaths.length; i++) {
				if (job.pictures.indexOf(imagePaths[i]) === -1) {
					job.pictures.push(imagePaths[i]);
				}
			}
			job.$update(function () {
				Alerts.show('success', 'Trabajo actualizado exitosamente');
				$state.reload();
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});
		};

		$scope.deleteImage = function (image) {

			// var job = $scope.job;
			var job = new Jobs();
			job._id = $scope.job._id;
			job.pictures = $scope.job.pictures;

			var index = job.pictures.indexOf(image);
			if (index > -1) {
				job.pictures.splice(index, 1);
			}

			job.$update(function () {
				Alerts.show('success', 'Imagen eliminada exitosamente');
				$state.reload();
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

				var approveRejectStatus = $scope.approvalAction == 'approved' ?
										  $scope.job.target_status : challengeDetails.status;

				if((!$scope.isServiceSupplier && !$scope.job.review[0]) &&
				   (($scope.approvalAction == 'approved' && approveRejectStatus.finished) ||
				   ($scope.approvalAction == 'rejected' && approveRejectStatus.finished))){
						var modalInstance = $scope.showReviewModal(approveRejectStatus);
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
			job.action = 'approval';

			if(approvalAction == 'approved'){
				job.approval = true;
			}
			else{
				//challengeDetails.status_reason = challengeDetails.status_reason._id; // TODO, check this since status reason
																					 // is not always required...
				challengeDetails.status = challengeDetails.status._id;
				job.approval_challenge_details = challengeDetails;
				job.approval = false;
			}

			if(reviewInfo) {job.review = [reviewInfo];}

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
			job.action = 'resolution';
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






