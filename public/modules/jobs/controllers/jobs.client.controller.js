'use strict';

// UserJobs controller
angular.module('jobs').controller('UserJobsController',
	function($scope, $stateParams, $state, Authentication, Jobs, ServiceSuppliers, $uibModal, Alerts, jobstatuses,
			 jobstatusreasons) {

		$scope.authentication = Authentication;
		$scope.alerts = Alerts;
		$scope.selectedservices = [];
		$scope.jobstatuses = jobstatuses;
		$scope.jobstatusreasons = jobstatusreasons;
		$scope.startDatePicker = {};
		$scope.finishDatePicker = {};

        // TODO: needed here? Or only on create + edit + details (maybe fine, so it's inherited)?
        $scope.dateFormats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.dateFormat = $scope.dateFormats[0];
        $scope.today = new Date();


		// If user is not signed in then redirect back home
		if (!$scope.authentication.user) {
			$state.go('home');
		} else {
			$scope.isServiceSupplier = $scope.authentication.user.roles.indexOf('servicesupplier') != -1;
			$scope.isAdmin = $scope.authentication.user.roles.indexOf('admin') != -1;
		}

		// TODO: maybe move this function, deleteSelectedService function and selectedservices array declaration above
		// to the edit controller? It may not be required here...
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

		$scope.openDatePicker = function($event, datePicker) {
			$event.preventDefault();
			$event.stopPropagation();

			datePicker.opened = true;
		};

		$scope.navigateToJobDetails = function(jobId) {
			$state.go('jobs.viewDetail', { jobId: jobId});
		};


		$scope.showReviewModal = function(jobstatus){

			return $uibModal.open({
				templateUrl: 'addReviewModal',
				controller: 'ReviewModalInstanceCtrl',
				resolve: {
					ratingtypes: function(RatingTypes){
						return RatingTypes.query().$promise;
					},
					jobstatus: jobstatus
				}
			});

		}
});

angular.module('jobs').controller('ReviewModalInstanceCtrl',
	function ($scope, Alerts, $uibModalInstance, ratingtypes, jobstatus) {

		$scope.alerts = Alerts;
		setRatingTypesFromStatus(jobstatus);
		$scope.rate = 3;

		function setRatingTypesFromStatus(status){
			$scope.ratings = [];
			for (var i = 0; i < ratingtypes.length; i++) {
				if(ratingtypes[i].jobstatuses.indexOf(status._id) != -1){
					$scope.ratings.push({ _id: ratingtypes[i]._id,
						name: ratingtypes[i].name,
						description: ratingtypes[i].description,
						rate: 3 });
				}

			}
		}

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




