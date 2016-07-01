'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersDetailController',
    function($scope, $state, $stateParams, Authentication, ServiceSuppliers,
             ServiceSuppliersDetails, $uibModal) {

        $scope.jobs = [];
        $scope.authentication = Authentication;

        ServiceSuppliers.get({
            servicesupplierId: $stateParams.servicesupplierId
        }).$promise.then(function(servicesupplier) {
                $scope.servicesupplier = servicesupplier;

                ServiceSuppliersDetails.jobs.query({
                    serviceSupplierId: $scope.servicesupplier._id
                }).$promise.then(function (jobs) {
                        $scope.jobs = jobs;
                    });
            });


        $scope.navigateToJobDetails = function(jobId) {
            if ($scope.authentication.user) {
                $state.go('servicesupplier.viewJobDetail', { servicesupplierId: $stateParams.servicesupplierId, jobId: jobId });
            } else {
                $state.go('viewJobDetail', { jobId: jobId});
            }
        };

        $scope.rate = 3;
        $scope.max = 5;

        $scope.hoveringOver = function(value) {
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
                    jobsforreview: function(JobSearch) {
                            return JobSearch.jobsForReview.query(
                            {serviceSupplierId: $scope.servicesupplier._id,
                             userId: $scope.authentication.user._id}).$promise;
                    },
                    ratingtypes: function(RatingTypes){
                        return RatingTypes.query().$promise;
                    },
                    jobstatuses: function(JobStatus){
                            return JobStatus.query().$promise;
                    }
                }
            });

            modalInstance.result.then(function (job) {
                $scope.addJob(job);
                $scope.servicesupplier.overall_rating = $scope.getUpdatedOverallRating();
            });
        };

        $scope.addJob = function(job){

            var found = false;
            for(var i=0;i<$scope.jobs.length;i++)
            {
                if(job._id == $scope.jobs[i]._id){
                    $scope.jobs[i] = job;
                    found = true;
                    break;
                }
            }

            if(!found){
                $scope.jobs.push(job);
            }

        }

        $scope.jobHasReview = function(job){
            return job.review.length > 0;
        }

        $scope.getUpdatedOverallRating = function() {

            var ratingsAvgSum = 0;
            var reviewsCount = 0;
            for(var i = 0; i<$scope.jobs.length;i++)
            {
                // if job has a review associated...this will change if we modify job model
                // to use a single review instead of array
                if($scope.jobs[i].review[0]){
                        ratingsAvgSum += parseFloat($scope.jobs[i].review[0].ratingsAvg);
                        reviewsCount++;
                }
            }
            return (ratingsAvgSum / reviewsCount).toFixed(2);
        }
    });

angular.module('servicesuppliers').controller('SupplierReviewModalInstanceCtrl',
    function ($scope, $uibModalInstance, Alerts, Jobs, jobsforreview, ratingtypes, jobstatuses) {

        $scope.alerts = Alerts;
        $scope.jobsforreview = jobsforreview;
        $scope.jobstatus = {name: '[Seleccione un resultado]'};
        $scope.servicesubcategories = $scope.servicesupplier.services;
        $scope.selectedservices = [];
        $scope.rate = 3;

        $scope.jobstatuses = [];
        for(var i=0; i<jobstatuses.length;i++)
        {
            if(jobstatuses[i].finished){
                $scope.jobstatuses.push(jobstatuses[i])
            }
        }

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


        // TODO: need to clear services if job is selected and then unselected/removed...
        /*$scope.watch('selectedjob', function(newvalue, oldvalue){
            if(newvalue.length == 0)
            {$scope.clearServices();}
        })*/

        $scope.setJobServices = function() {
            $scope.clearServices();
            for (var i = 0; i< $scope.selectedjob.services.length; i++) {
                $scope.selectedservices.push($scope.selectedjob.services[i])
            }

        }

        $scope.clearServices = function(){
            $scope.selectedservices.splice(0, $scope.selectedservices.length)
            $scope.selectedservice = '';
        }

        $scope.changeStatus = function(status){
            $scope.jobstatus = status;
        }

        $scope.ok = function () {

            // TODO: add client validation like Agus is doing with user registration.
            // to avoid this nested conditions...
            if ($scope.selectedservices.length) {
                if ($scope.comment) {
                    if($scope.jobstatus._id){

                        var jobinfo = {
                            job: $scope.selectedjob && $scope.selectedjob._id ? $scope.selectedjob._id : null,
                            services: $scope.selectedservices,
                            status: $scope.jobstatus._id

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
                    }
                    else {
                        Alerts.show('danger', 'Debes seleccionar un resultado...');
                    }


                } else {
                    Alerts.show('danger', 'Debes dejar un comentario');
                }
            } else {
                Alerts.show('danger','Debes seleccionar al menos un servicio');
            }
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
                jobpath: 'fromReview'
            });

            if(jobinfo.job){

                job._id = jobinfo.job;

                job.$update(function(job){
                    $uibModalInstance.close(job)
                }, function (errorResponse) {
                    // TODO: after clicking OK to submit we lose the rating types for next input...
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

                job.services = jobservices;
                job.service_supplier = $scope.servicesupplier._id;

                job.$save(function(job){
                    $uibModalInstance.close(job)
                }, function (errorResponse) {
                    // TODO: after clicking OK to submit we lose the rating types for next input...
                    $scope.error = errorResponse.data.message;
                    Alerts.show('danger', $scope.error);
                });
            }

        };

});