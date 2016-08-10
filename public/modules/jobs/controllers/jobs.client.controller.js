'use strict';

// UserJobs controller
angular.module('jobs').controller('UserJobsController',
	function($scope, $stateParams, $state, Authentication, Jobs, JobSearch, JobStatuses, ServiceSuppliers, $uibModal, Alerts) {

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
		
		// TODO: we may not need this for creation, since we just need the default status and no selection is possible
		// Check JobStatus service for alternatives to get only the default..
		// We'll need the other statuses for job update, though
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
		
		
		$scope.getAllJobs = function () {

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

});



