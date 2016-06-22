angular.module('jobs').controller('UserJobDetailsAndEditController',
	function ($scope, $stateParams, $state, Jobs, $uibModal, Alerts, Reviews) {

		// Find existing Job
		$scope.findOne = function () {
			Jobs.get({
				jobId: $stateParams.jobId
			}).$promise.then(function (job) {
					$scope.job = job;
					// Eliminating the search of job reviews.
					// There should be only one review per job
					// ...TODO: consider revising this later...but it seems it does not make sense....
					/*JobSearch.reviews.query({
					 jobId: $stateParams.jobId
					 }).$promise.then(function (response) {
					 $scope.reviews = response;
					 });*/
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
					// TODO: check if job status is finished (Completed or Abbandonned)
					// If so, then let the user know that a review is required. Another modal?
					if (job.status.finished) {
						$scope.openReviewModal(job); // note, server will take care of updating the job when
													 // the status is finished...
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

		$scope.openReviewModal = function (job) {

			var modalInstance = $uibModal.open({
				templateUrl: 'addReviewModal',
				controller: 'ReviewModalInstanceCtrl',
				resolve: {
					job: job,
					JobStatuses: function(JobStatus){
							return JobStatus.query().$promise;
						},

					RatingTypes: function(RatingTypes){
						return RatingTypes.query().$promise;
					}

				}
			});

			modalInstance.result.then(function (reviewInfo) {
				$scope.addReview(reviewInfo)
				// TODO: maybe just update the job on the server side (since reviewInfo should have the job?)?
				// What if the status update does not result in completed status? How are we updating it?
				// Since a review will either have a job (and its status will be updated)
				// or it will be generated on the fly...

			});
		};

		$scope.addReview = function (reviewInfo) {

			var ratings = [];
			for (var i = 0; i < reviewInfo.ratings.length; i++) {
				ratings.push({type: reviewInfo.ratings[i]._id, rate: reviewInfo.ratings[i].rate});
			}

			// Create new Review object and passing job data to be updated...
			var jobUpdatedDataForReview = {
				description: $scope.job.description,
				status: $scope.job.status._id,
				finish_date: $scope.job.finish_date
			};

			var review = new Reviews({
				service_supplier: $scope.job.service_supplier._id,
				user: $scope.authentication.user._id,
				comment: reviewInfo.comment,
				ratings: ratings,
				recommend: reviewInfo.recommend,
				job: $scope.job._id,
				jobDetails: jobUpdatedDataForReview,
				reviewPath: 'fromJob'
			});

			// Redirect after save
			review.$save(function (job) {
				$state.go('jobs.viewDetail', {jobId: job._id});
				// $scope.reviews.push(response);
				// Alerts.show('success', 'Rese\u00f1a creada exitosamente');
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
	function ($scope, $uibModalInstance, JobStatuses, RatingTypes, job) {

		$scope.job = job;

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

		$scope.selectedservices = job.services;
		$scope.rate = 3;

		$scope.ok = function () {

			var reviewInfo = {
				comment: $scope.comment,
				ratings: $scope.ratings,
				recommend: $scope.recommend
			};

			$uibModalInstance.close(reviewInfo);
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};

		$scope.changeStatus = function (status) {
			$scope.job.status = status;
		};


	});



