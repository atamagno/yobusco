'use strict';

// UserJobs controller
angular.module('jobs').controller('UserJobsController',
	function($scope, $stateParams, $state, Authentication, Jobs, JobSearch, JobStatus, ServiceSuppliers, Reviews, $uibModal, Alerts) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;

		JobStatus.query().$promise.then(function (statuses) {
			for (var i = 0; i < statuses.length; i++) {
				if (statuses[i].default) {
					$scope.defaultStatus = statuses[i];
					break;
				}
			}

			$scope.jobstatuses = statuses;
		});

		$scope.selectedServiceSupplier = undefined;
		ServiceSuppliers.query().$promise.then(function(servicesuppliers) {
			$scope.servicesuppliers = servicesuppliers;
			if ($stateParams.servicesupplierId) {
				for (var i = 0; i < servicesuppliers.length; i++) {
					if (servicesuppliers[i]._id === $stateParams.servicesupplierId) {
						$scope.selectedServiceSupplier = servicesuppliers[i];
						break;
					}
				}
			}
		});

		// Create new Job
		$scope.create = function() {

			if ($scope.selectedServiceSupplier && $scope.selectedServiceSupplier._id) {

				// Create new Job object
				var job = new Jobs({
					name: this.name,
					description: this.description,
					start_date: this.start_date,
					expected_date: this.expected_date,
					status: $scope.defaultStatus._id,
					service_supplier: $scope.selectedServiceSupplier._id
				});

				// Redirect after save
				job.$save(function (response) {
					$state.go('jobs.viewDetail', { jobId: response._id});

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
				Alerts.show('danger','Debes seleccionar un prestador de servicios');
			}
		};

		// Find existing Job
		$scope.findOne = function() {
			Jobs.get({
				jobId: $stateParams.jobId
			}).$promise.then(function(job) {
				$scope.job = job;
				JobSearch.reviews.query({
					jobId: $stateParams.jobId
				}).$promise.then(function (response) {
					$scope.reviews = response;
				});
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

		$scope.getAllJobs = function() {

			$scope.jobstatus = $stateParams.status;
			$scope.jobListTitle = 'Todos los trabajos';
			$scope.jobStatusLabel = '.';
			switch ($scope.jobstatus) {
				case 'active':
					$scope.jobListTitle = 'Trabajos activos';
					$scope.jobStatusLabel = ' activo.';
					break;
				case 'finished':
					$scope.jobListTitle = 'Trabajos terminados';
					$scope.jobStatusLabel = ' terminado.';
					break;
			}

			JobSearch.jobs.query({
				jobUserId: $scope.authentication.user._id,
				status: $scope.jobstatus
			}).$promise.then(function (response) {
					$scope.jobs = response;
				});
		};

		$scope.navigateToJobDetails = function(jobId) {
			if ($scope.authentication.user) {
				$state.go('jobs.viewDetail', { jobId: jobId});
			} else {
				$state.go('viewJobDetail', { jobId: jobId});
			}
		};

		$scope.addReview = function(reviewInfo) {

			var services = [];
			for (var i = 0; i < reviewInfo.selectedservices.length; i++) {
				services.push(reviewInfo.selectedservices[i]._id);
			}

			var ratings = [];
			for (var i = 0; i < reviewInfo.ratings.length; i++) {
				ratings.push({ type: reviewInfo.ratings[i]._id, rate: reviewInfo.ratings[i].rate });
			}

			// Create new Review object
			var review = new Reviews({
				comment: reviewInfo.comment,
				job: $scope.job._id,
				service_supplier: $scope.job.service_supplier._id,
				user: $scope.authentication.user._id,
				services: services,
				ratings: ratings
			});

			// Redirect after save
			review.$save(function (response) {
				$scope.reviews.push(response);
				Alerts.show('success','Rese\u00f1a creada exitosamente');
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});
		};

		$scope.changeStatus = function(status) {
			$scope.job.status = status;
		};

		// Update existing Job
		$scope.update = function() {
			var job = $scope.job;

			if (job.service_supplier && job.service_supplier._id) {

				if (job.status.finished && !job.finish_date) {
					Alerts.show('danger', 'Debes seleccionar una fecha de finalizaci\u00f3n');
				} else {
					job.$update(function() {
						$state.go('jobs.viewDetail', { jobId: job._id});
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
						Alerts.show('danger',$scope.error);
					});
				}

			} else {
				Alerts.show('danger','Debes seleccionar un prestador de servicios');
			}
		};

		$scope.addImages = function(imagePaths) {

			var job = $scope.job;
			for (var i = 0; i < imagePaths.length; i++) {
				if (job.pictures.indexOf(imagePaths[i]) === -1) {
					job.pictures.push(imagePaths[i]);
				}
			}

			job.$update(function() {
				Alerts.show('success','Trabajo actualizado exitosamente');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		$scope.deleteImage = function(image) {

			var job = $scope.job, index = job.pictures.indexOf(image);
			if (index > -1) {
				job.pictures.splice(index, 1);
			}

			job.$update(function() {
				Alerts.show('success','Imagen eliminada exitosamente');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
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

		$scope.openReviewModal = function () {

			var modalInstance = $uibModal.open({
				templateUrl: 'addReviewModal',
				controller: 'ReviewModalInstanceCtrl',
			});

			modalInstance.result.then(function (reviewInfo) {
				$scope.addReview(reviewInfo)
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
		};
	});

angular.module('jobs').controller('ReviewModalInstanceCtrl',
	function ($scope, $uibModalInstance, ServiceSubcategories, RatingTypes) {

		$scope.ratings = [];
		RatingTypes.query().$promise.then(function (types) {
			for (var i = 0; i < types.length; i++) {
				$scope.ratings.push({ _id: types[i]._id, name: types[i].name, description: types[i].description, rate: 3 });
			}
		});
		$scope.servicesubcategories = ServiceSubcategories.query();
		$scope.selectedservices = [];
		$scope.rate = 3;

		$scope.ok = function () {
			var reviewInfo = {
				comment: $scope.comment,
				selectedservices: $scope.selectedservices,
				ratings: $scope.ratings
			};

			$uibModalInstance.close(reviewInfo);
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};

		$scope.selectService = function ($item) {

			var alreadySelected = false;
			for (var i = 0; i < $scope.selectedservices.length; i++) {
				if ($item._id === $scope.selectedservices[i]._id) {
					alreadySelected = true;
					break;
				}
			}

			if (!alreadySelected) {
				$scope.selectedservices.push($item);
			}

			$scope.selected = '';
		};

		$scope.deleteSelectedService = function(index) {
			$scope.selectedservices.splice(index, 1);
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