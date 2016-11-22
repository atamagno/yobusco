'use strict';

// UserJobs controller
angular.module('jobs').controller('UserJobsController',
	function($scope, $stateParams, $state, Authentication, Jobs, JobStatuses, ServiceSuppliers, $uibModal, Alerts) {

		$scope.authentication = Authentication;
		$scope.alerts = Alerts;
		$scope.selectedservices = [];
		$scope.jobstatuses = JobStatuses;

		// If user is not signed in then redirect back home
		if (!$scope.authentication.user) {
			$state.go('home');
		} else {
			$scope.isServiceSupplier = $scope.authentication.user.roles.indexOf('servicesupplier') != -1;
			$scope.isAdmin = $scope.authentication.user.roles.indexOf('admin') != -1;
		}

		// TODO: maybe move this function, deleteSelectedService function and selectedservices array declaration above
		// to the detailsandedit controller? It may not be required here...
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

		// TODO: needed here? Or only on create + edit?
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


		$scope.showReviewModal = function(){

			return $uibModal.open({
				templateUrl: 'addReviewModal',
				controller: 'ReviewModalInstanceCtrl',
				resolve: {
					RatingTypes: function(RatingTypes){
						return RatingTypes.query().$promise;
					}
				}
			});

		}
});

angular.module('jobs').controller('ReviewModalInstanceCtrl',
	function ($scope, Alerts, $uibModalInstance, RatingTypes) {

		$scope.alerts = Alerts;
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

		$scope.rate = 3;

		$scope.ok = function () {

			if ($scope.comment) {

				// Converting review ratings in the format used by server.
				// TODO: maybe we can try to use the server format from the client and avoid this.
				for (var i = 0; i < $scope.ratings.length; i++) {
					$scope.ratings[i] = { type: $scope.ratings[i]._id, rate: $scope.ratings[i].rate };
				}

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

});




