angular.module('jobs').controller('UserJobDetailsAndEditController',
	function ($scope, $stateParams, $state, Jobs, $uibModal, Alerts) {

		// Find existing Job
		$scope.findOne = function () {
			Jobs.get({
				jobId: $stateParams.jobId
			}).$promise.then(function (job) {
					$scope.job = job;
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
					if (job.status.finished) {
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

			var modalInstance = $uibModal.open({
				templateUrl: 'addReviewModal',
				controller: 'ReviewModalInstanceCtrl',
				scope: $scope,
				resolve: {
					JobStatuses: function(JobStatus){
						return JobStatus.query().$promise;
					},
					RatingTypes: function(RatingTypes){
						return RatingTypes.query().$promise;
					}
				}
			});

			modalInstance.result.then(function (reviewinfo) {

				$scope.addReview(reviewinfo)

			});
		};

		$scope.addReview = function (reviewinfo) {

			var job = $scope.job;
			var ratings = [];

			// Converting review ratings in the format used by server.
			for (var i = 0; i < reviewinfo.ratings.length; i++) {
				reviewinfo.ratings[i] = { type: reviewinfo.ratings[i]._id, rate: reviewinfo.ratings[i].rate };
			}

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


angular.module('jobs').controller('ReviewModalInstanceCtrl',
	function ($scope, Alerts, $uibModalInstance, JobStatuses, RatingTypes) {

		$scope.finishedjobstatuses = [];
		for(var i=0; i<JobStatuses.length;i++)
		{
				if(JobStatuses[i].finished){
					$scope.finishedjobstatuses.push(JobStatuses[i])
				}
		}

		// Mapping rating types obtained from service (see resolve item in modal controller configuration)
		// to the rating objects used by the uib-rating directive
		// TODO: What if we just add a 'defaultRate' property/virtual to the object on the database/model,
		// would we still need this mapping?
		$scope.ratings = [];
		for (var i = 0; i < RatingTypes.length; i++) {
				$scope.ratings.push({ 	_id: RatingTypes[i]._id,
									 	name: RatingTypes[i].name,
										description: RatingTypes[i].description,
										rate: 3 });
		}

		$scope.selectedservices = $scope.job.services;
		$scope.rate = 3;

		$scope.ok = function () {

			if ($scope.comment) {

				var reviewinfo = {
					comment: $scope.comment,
					ratings: $scope.ratings,
					recommend: $scope.recommend
				};
				$uibModalInstance.close(reviewinfo);


			} else {
					Alerts.show('danger', 'Debes dejar un comentario');
			}
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};

		$scope.changeStatus = function (status) {
			$scope.job.status = status;
		};

	});



