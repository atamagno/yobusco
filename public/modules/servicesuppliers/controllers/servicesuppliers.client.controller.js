'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersDetailController',
    function($scope, $state, $stateParams, Authentication, ServiceSuppliers,
             ServiceSuppliersDetails, $uibModal) {

        $scope.jobs = [];
        $scope.authentication = Authentication;
        $scope.rate = 3;
        $scope.max = 5;


        if ($scope.authentication.user) {
            $scope.isServiceSupplier = $scope.authentication.user.roles.indexOf('servicesupplier') != -1;
        }

        ServiceSuppliers.get({
            servicesupplierId: $stateParams.servicesupplierId
        }).$promise.then(function (servicesupplier) {
                $scope.servicesupplier = servicesupplier;
                getReviewsForSupplier($stateParams.servicesupplierId);
        });

        function getReviewsForSupplier(servicesupplierId) {

            ServiceSuppliersDetails.reviews.query({
                serviceSupplierId: servicesupplierId,
                currentPage: 1,
                itemsPerPage: 6
            }).$promise.then(function (response) {
                    $scope.jobs = response.jobs;
                });
        };


        $scope.hoveringOver = function (value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.max);
        };

        $scope.openReviewModal = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'addSupplierReviewModal',
                controller: 'SupplierReviewModalInstanceCtrl',
                scope: $scope,
                resolve: {

                    // Getting jobs that can be used for a review.
                    jobsforreview: function (JobDetails) {
                        return JobDetails.jobsForReview.query(
                            {
                                serviceSupplierId: $scope.servicesupplier._id,
                                userId: $scope.authentication.user._id
                            }).$promise;
                    },
                    ratingtypes: function (RatingTypes) {
                        return RatingTypes.query().$promise;
                    },
                    jobstatuses: function (JobStatus) {
                        return JobStatus.query().$promise;
                    },
                    jobstatusreasons: function(JobStatusReasons){
                        return JobStatusReasons.query().$promise;
                    }
                }
            });

            modalInstance.result.then(function (job) {
                $state.reload();
            });
        };

    });

angular.module('servicesuppliers').controller('SupplierReviewModalInstanceCtrl',
    function ($scope, $uibModalInstance, Alerts, Jobs, JobStatusReasonsHelper, JobStatusHelper, jobsforreview, ratingtypes, jobstatuses, jobstatusreasons) {

        $scope.alerts = Alerts;
        $scope.jobsforreview = jobsforreview;
        $scope.jobstatus = {name: '[Seleccione un resultado]'};
        $scope.selectedjob = {name: '[Seleccione un trabajo]'};
        $scope.servicesubcategories = $scope.servicesupplier.services;
        $scope.selectedservices = [];
        $scope.statusdisabled = false;
        $scope.statusreasonsdisabled = false;
        $scope.jobsforreviewvisible = true;
        $scope.reviewservicesvisible = true;
        $scope.rate = 3;
        $scope.dateFormats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.dateFormat = $scope.dateFormats[0];
        $scope.finishDatePicker = {};
        $scope.today = new Date();
        $scope.jobfinishdate = $scope.today;

        $scope.jobstatuses = JobStatusHelper.getStatusesForReview(jobstatuses,$scope.authentication.user.roles);

        // Mapping rating types obtained from service (see resolve item in modal controller configuration)
        // to the rating objects used by the uib-rating directive
        // TODO: What if we just add a 'defaultRate' property/virtual to the object on the database/model,
        // would we still need this mapping?
        $scope.ratings = [];
        for (var i = 0; i < ratingtypes.length; i++) {
            $scope.ratings.push({ _id: ratingtypes[i]._id,
                name: ratingtypes[i].name,
                description: ratingtypes[i].description,
                rate: 3 });
        }

        $scope.openDatePicker = function($event, datePicker) {
            $event.preventDefault();
            $event.stopPropagation();

            datePicker.opened = true;
        };

        $scope.removeJobSelection = function(){
            $scope.clearServices();
            $scope.selectedjob = {name: '[Seleccione un trabajo]'};
            $scope.jobstatus = {name: '[Seleccione un resultado]'};
            $scope.statusdisabled = false;

            $scope.jobstatuses = JobStatusHelper.getStatusesForReview(jobstatuses,$scope.authentication.user.roles);
            //$scope.jobstatuses.push(jobstatuses[getNotHiredStatusIndex(jobstatuses)]);
            $scope.jobfinishdatevisible = false;
            $scope.statusreasons = []; // TODO: this can be removed and populated only on status change to finished
                                       // just like done with finish date....???
                                       // It's being used in validatiobn prior to submitting review...
            $scope.statusreasonsvisible = false;
            $scope.statusreasonsdisabled = false;
            $scope.statusreason = {description: '[Seleccione una opcion]'};
        }

        $scope.setJobProperties = function(jobforreview) {

            $scope.selectedjob = jobforreview;
            $scope.jobfinishdatevisible = false;

            //$scope.jobstatuses.splice(getNotHiredStatusIndex($scope.jobstatuses),1);
            $scope.clearServices();
            for (var i = 0; i< $scope.selectedjob.services.length; i++) { // TODO: isn't the same to just assign the array?
                $scope.selectedservices.push($scope.selectedjob.services[i])
            }

            $scope.statusreason = {description: '[Seleccione una opcion]'};
            if($scope.selectedjob.status.finished || $scope.selectedjob.status.post_finished){
                $scope.statusdisabled = true;
                $scope.jobstatus = $scope.selectedjob.status;
                setRatingTypesFromStatus($scope.jobstatus);
                if($scope.selectedjob.status_reason){
                    $scope.statusreasonsdisabled = true;
                    $scope.statusreasonsvisible = true;
                    $scope.statusreason = $scope.selectedjob.status_reason;
                }
                else{
                    $scope.statusreasonsdisabled = false;
                    $scope.statusreasonsvisible = false;
                }

            }
            else{
                $scope.jobstatuses = JobStatusHelper.getPossibleNextStatuses($scope.selectedjob.status,$scope.authentication.user.roles,false);
                $scope.jobstatus = {name: '[Seleccione un resultado]'};
                $scope.statusdisabled = false;
                $scope.statusreasonsdisabled = false;
            }

        };


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

        $scope.clearServices = function(){
            $scope.selectedservices.splice(0, $scope.selectedservices.length)
            $scope.selectedservice = '';
        }

        $scope.changeStatusReason = function(statusReason){
            $scope.statusreason = statusReason;
        }

        $scope.changeStatus = function(status){
            $scope.jobstatus = status;
            setRatingTypesFromStatus(status);

            if(status.keyword == 'nothired'){
                $scope.jobsforreviewvisible = false;
                $scope.reviewservicesvisible = false;
                $scope.clearServices();
            }
            else{
                $scope.jobsforreviewvisible = true;
                $scope.reviewservicesvisible = true;
            }

            // TODO: would the else be ever executed?
            // Considering jobs for review should only transition to finished
            // and statuses for reviews is the same too?
            if(status.finished){
                    $scope.jobfinishdatevisible = true;
            }
            else{
                    $scope.jobfinishdatevisible = false;
            }

            $scope.statusreason = {description: '[Seleccione una opcion]'};
            $scope.statusreasons = JobStatusReasonsHelper.getReasons(jobstatusreasons,status,$scope.authentication.user.roles);
            if($scope.statusreasons.length){
                $scope.statusreasonsvisible = true;
                $scope.statusreasondisabled = false;

            }
            else{
                $scope.statusreasonsvisible = false;
                $scope.statusreasondisabled = true;
            }

        }

        $scope.ok = function () {

            // TODO: add client validation like Agus is doing with user registration.
            // to avoid this nested conditions...
            if (!$scope.comment) {
                Alerts.show('danger', 'Debes dejar un comentario');
                return;
            }

            if(!$scope.jobstatus._id){
                Alerts.show('danger', 'Debes seleccionar un resultado');
                return;
            }

            if(!$scope.selectedservices.length && $scope.jobstatus.keyword != 'nothired'){
                Alerts.show('danger','Debes seleccionar al menos un servicio');
                return;
            }

            // TODO: Update validation rule for status reason (based on submit logic below...)
            /*if($scope.statusreasons.length && !$scope.statusreason._id){
                Alerts.show('danger','Debes seleccionar una opcion de razon del resultado');
                return;

            }*/

            // TODO: add validation for finish date here..

            var jobinfo = {
                job: $scope.selectedjob && $scope.selectedjob._id ? $scope.selectedjob._id : null, // TODO: is $scope.selectedjob required here? Given that it's set on controller init?
                services: $scope.selectedservices, // TODO: are selected services here always required?
                                                   // probably only in case a review is created without a job...
                                                   // In case of a job, we're probably just submitting the same services as existed on the job...
                status: $scope.jobstatus._id//,
            }

            // Submit finish date only if job was not selected (review without job) and the status selected was a finished one (different than not hired)
            // OR job selected was not in finished status...
            if((!jobinfo.job && $scope.jobstatus.finished) ||
               (jobinfo.job && !$scope.selectedjob.status.finished)){
                jobinfo.finish_date = $scope.jobfinishdate;
            }

            // Submit status reason only if job was not selected (review without job) and a status reason was selected
            // or if a status reason was selected for a job, and it did not have one.
            if(!jobinfo.job && $scope.statusreason._id ||
                (jobinfo.job && !$scope.selectedjob.status_reason && $scope.statusreason._id)){
                jobinfo.status_reason = $scope.statusreason._id;
            }

            // Converting review ratings in the format used by server.
            var ratings = [];
            for (var i = 0; i < $scope.ratings.length; i++) {
                ratings.push({ type: $scope.ratings[i]._id, rate: $scope.ratings[i].rate });
            }

            var reviewinfo = {
                comment: $scope.comment,
                ratings: ratings,
                recommend: $scope.recommend
            };

            $scope.addReview(jobinfo, reviewinfo);



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

            $scope.selectedservice = '';
        };

        $scope.deleteSelectedService = function(index) {
            $scope.selectedservices.splice(index, 1);
        };

        $scope.addReview = function(jobinfo, reviewinfo) {


            // If an existing job was selected for the review, we'll just update it
            var job = new Jobs({
                status: jobinfo.status,
                review: [reviewinfo],
                status_reason: jobinfo.status_reason,
                finish_date: jobinfo.finish_date
            });

            if(jobinfo.job){

                job._id = jobinfo.job;
                job.$update(function(job){
                    $uibModalInstance.close(job)
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                    Alerts.show('danger', $scope.error);
                });

            } // otherwise we'll create it from the data entered.
            else
            {
                var jobservices = [];
                for (var i = 0; i < jobinfo.services.length; i++) {
                    jobservices.push(jobinfo.services[i]._id);
                }

                job.jobpath = 'fromReview';
                job.services = jobservices;
                job.service_supplier = $scope.servicesupplier._id;
                job.user = $scope.authentication.user._id;

                job.$save(function(job){
                    $uibModalInstance.close(job)
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                    Alerts.show('danger', $scope.error);
                });
            }

        };

});