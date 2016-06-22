'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersDetailController',
    function($scope, $state, $stateParams, Authentication, ServiceSuppliers, ServiceSuppliersDetails, Reviews, $uibModal) {
        $scope.authentication = Authentication;

        if ($scope.authentication.user) {
            $scope.isServiceSupplier = $scope.authentication.user.roles.indexOf('servicesupplier') != -1;
        }

        ServiceSuppliers.get({
            servicesupplierId: $stateParams.servicesupplierId
        }).$promise.then(function(servicesupplier) {
                $scope.servicesupplier = servicesupplier;

                // TODO: we should probably paginate the reviews and jobs
                // Or maybe display just the most recent xxx on the details view,
                // and provide a 'More' option and redirect to the reviews view, with paginated
                // results.
                ServiceSuppliersDetails.reviews.query({
                    serviceSupplierId: $scope.servicesupplier._id
                }).$promise.then(function (response) {
                        $scope.reviews = response;
                    });

                ServiceSuppliersDetails.jobs.query({
                    serviceSupplierId: $scope.servicesupplier._id
                }).$promise.then(function (response) {
                        $scope.jobs = response;
                    });
            });

        $scope.navigateToJobDetails = function(jobId) {
            $state.go('servicesupplier.viewJobDetail', { servicesupplierId: $stateParams.servicesupplierId, jobId: jobId });
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
                    jobs: function(JobDetails) {
                        return JobDetails.jobsForReview.query({
                                serviceSupplierId: $scope.servicesupplier._id,
                                userId: $scope.authentication.user._id}).$promise;
                    },
                    ratingtypes: function(RatingTypes) {
                        return RatingTypes.query().$promise;
                    },
                    jobstatuses: function(JobStatus) {
                        return JobStatus.query().$promise;
                    }
                }
            });

            modalInstance.result.then(function (review) {
                $scope.reviews.splice(0, 0, review);
                review.user = $scope.authentication.user;
                $scope.servicesupplier.overall_rating = $scope.getUpdatedOverallRating();
            });
        };

        $scope.getUpdatedOverallRating = function() {

            var ratingsAvgSum = 0;
            $scope.reviews.forEach(function(review) {
                ratingsAvgSum+= parseFloat(review.ratingsAvg);
            })
            return (ratingsAvgSum / $scope.reviews.length).toFixed(2);
        }
    });

angular.module('servicesuppliers').controller('SupplierReviewModalInstanceCtrl',
    function ($scope, $uibModalInstance, Alerts, Reviews, jobs, ratingtypes, jobstatuses) {

        $scope.alerts = Alerts;
        $scope.jobs = jobs;
        $scope.jobstatus = { name: 'Seleccione un resultado' };
        $scope.servicesubcategories = $scope.servicesupplier.services;
        $scope.selectedservices = [];
        $scope.rate = 3;

        $scope.jobstatuses = [];
        for(var i = 0; i < jobstatuses.length; i++)
        {
            if (jobstatuses[i].finished) {
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

            if (!$scope.selectedservices.length) {
                Alerts.show('danger','Debes seleccionar al menos un servicio.');
                return;
            }

            if (!$scope.comment) {
                Alerts.show('danger', 'Debes dejar un comentario.');
                return;
            }

            if (!$scope.jobstatus._id) {
                Alerts.show('danger', 'Debes seleccionar un resultado del trabajo.');
                return;
            }

            var reviewInfo = {
                job: $scope.selectedjob && $scope.selectedjob._id ? $scope.selectedjob._id : null,
                services: $scope.selectedservices,
                comment: $scope.comment,
                ratings: $scope.ratings,
                recommend: $scope.recommend ? true : false
            };

            $scope.addReview(reviewInfo);
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

        $scope.addReview = function(reviewInfo) {

            var services = [];
            for (var i = 0; i < reviewInfo.services.length; i++) {
                services.push(reviewInfo.services[i]._id);
            }

            var ratings = [];
            for (var i = 0; i < reviewInfo.ratings.length; i++) {
                ratings.push({ type: reviewInfo.ratings[i]._id, rate: reviewInfo.ratings[i].rate });
            }

            var jobDetails = {
                status: $scope.jobstatus._id,
                services: services
            };

            // Create new Review object
            var review = new Reviews({
                service_supplier: $scope.servicesupplier._id,
                user: $scope.authentication.user._id,
                comment: reviewInfo.comment,
                ratings: ratings,
                recommend: reviewInfo.recommend,
                job: reviewInfo.job,
                jobDetails: jobDetails,
                reviewPath: 'fromReview'
            });

            // Redirect after save
            review.$save(function (review) {
                $uibModalInstance.close(review)
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
                Alerts.show('danger', $scope.error);
            });

        };
    });