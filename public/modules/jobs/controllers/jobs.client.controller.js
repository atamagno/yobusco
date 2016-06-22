'use strict';

// UserJobs controller
angular.module('jobs')
	.controller('UserJobsController',
	function($scope, $stateParams, $state, Authentication, Jobs, JobDetails, JobStatuses, ServiceSuppliers, Alerts) {

		$scope.authentication = Authentication;
		$scope.alerts = Alerts;
		$scope.selectedservices = [];

		$scope.itemsPerPage = 6;
		$scope.maxPages = 5;
		$scope.showList = false;

		// If user is not signed in then redirect back home
		if (!$scope.authentication.user) {
			$state.go('home');
		} else {
			$scope.isServiceSupplier = $scope.authentication.user.roles.indexOf('servicesupplier') != -1;
		}

		$scope.jobstatuses = JobStatuses;
		for (var i = 0; i < $scope.jobstatuses.length; i++) {
			if ($scope.jobstatuses[i].default) {
				$scope.defaultStatus = $scope.jobstatuses[i];
				break;
			}
		}

		$scope.jobstatuses = $scope.jobstatuses.filter(filterPendingStatus);

		function filterPendingStatus(status) {
			return status.keyword != 'pending';
		}

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

			$scope.selectedservice = '';
		};

		$scope.deleteSelectedService = function (index) {
			$scope.selectedservices.splice(index, 1);
		};

		// TODO: needed here? Or only on create?
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

		$scope.navigateToJobDetails = function(jobId) {
			$state.go('jobs.viewDetail', { jobId: jobId});
		};

		$scope.$on('updateReported', function(event, reportedJobs) {
			$scope.reportedJobs = reportedJobs;
		});
	})
	.controller('ListJobsController',
	function($scope, $rootScope, $state, $stateParams, JobDetails) {

		$scope.getAllJobs = function() {

			$scope.showList = false;
			$scope.jobstatus = $stateParams.status;
			$scope.currentPage = $stateParams.currentPage;

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
				case 'pending':
					$scope.jobListTitle = 'Trabajos pendientes de aprobacion';
					$scope.jobStatusLabel = ' pendiente de aprobacion.';
					break;
			}

			if (!$scope.jobs) {
				JobDetails.jobs.query({
					currentPage: $stateParams.currentPage,
					itemsPerPage: $scope.itemsPerPage,
					jobUserId: $scope.authentication.user._id,
					isServiceSupplier: $scope.isServiceSupplier,
					status: 'all',
				}).$promise.then(function (response) {
						$scope.currentPage = $stateParams.currentPage;
						$scope.jobs = response.jobs;
						$scope.filterJobs = $scope.jobs;
						$scope.totalItems = response.totalItems;
						if ($scope.jobstatus != 'all') {
							$scope.filterJobs = $scope.jobs.filter(filterByStatus);
							$scope.totalItems = $scope.filterJobs.length;
						}

						$scope.showList = $scope.totalItems > 0;
						var reportedJobList = $scope.jobs.filter(filterReported);
						var reportedJobs = reportedJobList.length > 0;

						$rootScope.$broadcast('updateReported', reportedJobs);
					});
			} else {

				if ($scope.jobstatus != 'all') {
					$scope.filterJobs = $scope.jobs.filter(filterByStatus);
					$scope.totalItems = $scope.filterJobs.length;
				}

				$scope.showList = $scope.totalItems > 0;
				var reportedJobList = $scope.jobs.filter(filterReported);
				var reportedJobs = reportedJobList.length > 0;

				$rootScope.$broadcast('updateReported', reportedJobs);
			}
		};

		$scope.navigateToResults = function() {
			$state.go('jobs.list', {
				status: $scope.jobstatus,
				currentPage: $scope.currentPage,
				itemsPerPage: $scope.itemsPerPage
			});
		};

		function filterByStatus(job) {
			switch ($scope.jobstatus) {
				case 'active':
				case 'pending':
					return ((job.status.keyword == $scope.jobstatus) && !job.reported);
				case 'finished':
					return (job.status.finished && !job.reported);
				case 'reported':
					return job.reported;
			}
		}

		function filterReported(job) {
			return job.reported;
		}
	})
	.controller('JobDetailsController',
	function($scope, $rootScope, $state, $stateParams, Reviews, $uibModal, Alerts, Jobs, JobDetails) {

		// Find existing Job
		$scope.findOne = function() {
			Jobs.get({
				jobId: $stateParams.jobId
			}).$promise.then(function(job) {
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

		$scope.openApproveJobModal = function() {

			var modalInstance = $uibModal.open({
				templateUrl: 'approveJobModal',
				controller: 'ApproveJobModalInstanceCtrl'
			});

			modalInstance.result.then(function () {
				$scope.approveJob()
			});
		};

		$scope.approveJob = function() {
			var job = $scope.job;

			// Get active status from list of statuses.
			for (var i = 0; i < $scope.jobstatuses.length; i++) {
				if ($scope.jobstatuses[i].keyword == 'active') {
					job.status = $scope.jobstatuses[i];
					break;
				}
			}
			job.$update(function() {
				Alerts.show('success','Trabajo aprobado exitosamente');
				$state.go('jobs.viewDetail', { jobId: job._id});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		$scope.reportJob = function() {
			var job = $scope.job;
			job.reported = true;

			job.$update(function() {
				$rootScope.$broadcast('updateReported', true);
				Alerts.show('success','Trabajo reportado exitosamente')
				$state.go('jobs.viewDetail', { jobId: job._id });
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		};

		$scope.openReportJobModal = function() {

			var modalInstance = $uibModal.open({
				templateUrl: 'reportJobModal',
				controller: 'ReportJobModalInstanceCtrl'
			});

			modalInstance.result.then(function () {
				$scope.reportJob()
			});
		};

		$scope.addReview = function(reviewInfo) {

			/*
			var services = [];
			for (var i = 0; i < reviewInfo.selectedservices.length; i++) {
				services.push(reviewInfo.selectedservices[i]._id);
			}*/

			var ratings = [];
			for (var i = 0; i < reviewInfo.ratings.length; i++) {
				ratings.push({ type: reviewInfo.ratings[i]._id, rate: reviewInfo.ratings[i].rate });
			}

			// Create new Review object and passing job data to be updated...
			var jobUpdatedDataForReview = {
				description: $scope.job.description,
				status: $scope.job.status._id,
				finish_date: $scope.job.finish_date
			};

			// Create new Review object
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
				$state.go('jobs.viewDetail', { jobId: job._id });
				//$scope.reviews.push(response);
				//Alerts.show('success','Rese\u00f1a creada exitosamente');
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});
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

		$scope.changeStatus = function(status) {
			$scope.job.status = status;
		};

		// Update existing Job
		$scope.update = function() {
			var job = $scope.job;

			if (job.service_supplier && job.service_supplier._id) {
				// TODO: we should probably pre-populate finish_date date picker with current date...
				// So we probably don't need this check....Avoid past date???
				if (job.status.finished && !job.finish_date) {
					Alerts.show('danger', 'Debes seleccionar una fecha de finalizaci\u00f3n');
				} else {
					// TODO: check if job status is finished (Completed or Abandoned)
					// If so, then let the user know that a review is required. Another modal?
					if (job.status.finished) {
						$scope.openReviewModal(job); // note, server will take care of updating the job when
													 // the status is finished...
					} else {
						job.$update(function() {
							$state.go('jobs.viewDetail', { jobId: job._id});
						}, function(errorResponse) {
							$scope.error = errorResponse.data.message;
							Alerts.show('danger',$scope.error);
						});
					}
				}

			} else {
				Alerts.show('danger','Debes seleccionar un prestador de servicios');
			}
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
	})
	.controller('CreateJobController',
	function($scope, $stateParams, $state, $uibModal, Alerts, Jobs, UserSearch, ServiceSuppliers, ServiceSubcategories) {

		$scope.selectedServiceSupplier = undefined;
		if ($stateParams.servicesupplierId) {
			$scope.createFromServiceSupplier = true;
			ServiceSuppliers.get({ servicesupplierId: $stateParams.servicesupplierId })
				.$promise.then(function(servicesupplier){
					$scope.selectedServiceSupplier = servicesupplier;
					$scope.servicesubcategories = $scope.selectedServiceSupplier.services;
				});
		} else {
			ServiceSuppliers.query().$promise.then(function(servicesuppliers) {
				$scope.servicesuppliers = servicesuppliers;
				$scope.servicesubcategories = ServiceSubcategories.query();
			});
		}

		function getServiceSupplierForUser() {

			var serviceSupplier;
			for (var i = 0; i < $scope.servicesuppliers.length; i++) {
				if ($scope.servicesuppliers[i].user._id === $scope.authentication.user._id) {
					serviceSupplier = $scope.servicesuppliers[i];
					break;
				}
			}

			return serviceSupplier;
		}

		// Create new Job
		$scope.create = function() {

			// if logged user is a service supplier
			if ($scope.isServiceSupplier) {
				if ($scope.selectedUserName) {
					UserSearch.get({
						userName: $scope.selectedUserName
					}).$promise.then(function (user) {
							if (user._id) {

								$scope.selectedServiceSupplier = getServiceSupplierForUser();

								saveJob(user._id, $scope.selectedServiceSupplier._id, false);
							}
							else {
								Alerts.show('danger','El nombre de usuario no existe.');
							}
						});
				}
				else
				{
					Alerts.show('danger','Debes ingresar un nombre de usuario.');
				}
			}
			else {
				if ($scope.selectedServiceSupplier && $scope.selectedServiceSupplier._id) {

					saveJob($scope.authentication.user._id, $scope.selectedServiceSupplier._id, true);

				} else {
					Alerts.show('danger','Debes seleccionar un prestador de servicios');
				}
			}
		};

		function saveJob(userID, selectedServiceSupplierID, createdByUser) {

			// TODO: add validation for selected services here.
			// Check how angular form validation has been implemented in admin (user search form).
			// adminEnhancements branch...
			var services = [];
			for (var i = 0; i < $scope.selectedservices.length; i++) {
				services.push($scope.selectedservices[i]._id);
			}

			// Create new Job object
			var job = new Jobs({
				name: $scope.name,
				description: $scope.description,
				start_date: $scope.start_date,
				expected_date: $scope.expected_date,
				status: $scope.defaultStatus._id,
				user: userID,
				service_supplier: selectedServiceSupplierID,
				createdByUser: createdByUser,
				services: services
			});

			// Redirect after save
			job.$save(function (response) {

				// NOTE: when transitioning to viewDetail state,
				// this same controller gets instantiated (is there a way to avoid the
				// global functions (e.g.: get service supplier) to be executed?)
				// We probably don't have stateParams.servicesupplierId when transitioning to this state,
				// thus ServiceSuppliers.get returns an empty array (and we get an angular exception)
				// Maybe we need a separate controller for the viewDetail view.
				$state.go('jobs.viewDetail', { jobId: response._id});
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});
		}

		$scope.openCreateJobModal = function () {

			var modalInstance = $uibModal.open({
				templateUrl: 'createJobModal',
				controller: 'CreateJobModalInstanceCtrl'
			});

			modalInstance.result.then(function () {
				$scope.create()
			});
		};
	});

angular.module('jobs').controller('ReviewModalInstanceCtrl',
	function ($scope, $uibModalInstance, JobStatuses, RatingTypes, job) {

		$scope.job = job;

		$scope.finishedjobstatuses = [];
		for (var i = 0; i < JobStatuses.length; i++)
		{
			if (JobStatuses[i].finished){
				$scope.finishedjobstatuses.push(JobStatuses[i])
			}
		}

		// Mapping rating types obtained from service (see resolve item in modal controller configuration)
		// to the rating objects used by the uib-rating directive
		// TODO: What if we just add a 'defaultRate' property/virtual to the object on the database/model,
		// would we still need this mapping?
		$scope.ratings = [];
		for (var i = 0; i < RatingTypes.length; i++) {
			$scope.ratings.push(
			{
				_id: RatingTypes[i]._id,
				name: RatingTypes[i].name,
				description: RatingTypes[i].description,
				rate: 3
			});
		}

		/*
		$scope.ratings = [];
		RatingTypes.query().$promise.then(function (types) {
			for (var i = 0; i < types.length; i++) {
				$scope.ratings.push({ _id: types[i]._id, name: types[i].name, description: types[i].description, rate: 3 });
			}
		});
		*/

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

angular.module('jobs').controller('EditJobModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
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

				file.upload.then(function () {
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

angular.module('jobs').controller('ApproveJobModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});

angular.module('jobs').controller('ReportJobModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});