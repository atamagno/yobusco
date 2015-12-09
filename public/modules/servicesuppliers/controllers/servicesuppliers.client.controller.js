'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersDetailController',
    function($scope, $stateParams, Authentication, ServiceSuppliers, ServiceSuppliersDetails, Reviews, Alerts, $modal) {
        $scope.authentication = Authentication;

        ServiceSuppliers.get({
            servicesupplierId: $stateParams.servicesupplierId
        }).$promise.then(function(servicesupplier) {
                $scope.servicesupplier = servicesupplier;

                ServiceSuppliersDetails.reviews.query({
                    serviceSupplierId: $scope.servicesupplier._id,
                }).$promise.then(function (response) {
                        $scope.reviews = response;
                    });

                ServiceSuppliersDetails.jobs.query({
                    serviceSupplierId: $scope.servicesupplier._id,
                }).$promise.then(function (response) {
                        $scope.jobs = response;
                    });
            });

        $scope.rate = 3;
        $scope.max = 5;

        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.max);
        };

        $scope.openReviewModal = function () {

            var modalInstance = $modal.open({
                templateUrl: 'addSupplierReviewModal',
                controller: 'SupplierReviewModalInstanceCtrl',
                resolve: {
                    jobs: function () {
                        var finishedJobs = [];
                        for (var i = 0; i < $scope.jobs.length; i++) {
                            if (['Completed', 'Abandoned'].indexOf($scope.jobs[i].status.name) !== -1) {
                                finishedJobs.push($scope.jobs[i]);
                            }
                        }
                        return finishedJobs;
                    }
                }
            });

            modalInstance.result.then(function (reviewInfo) {
                $scope.addReview(reviewInfo)
            });
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
                job: reviewInfo.job,
                service_supplier: $scope.servicesupplier._id,
                user: $scope.authentication.user._id,
                services: services,
                ratings: ratings
            });

            // Redirect after save
            review.$save(function (response) {
                $scope.reviews.push(response);
                Alerts.show('success','Review successfully created');
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
                Alerts.show('danger', $scope.error);
            });

        };
    });

angular.module('servicesuppliers').controller('SupplierReviewModalInstanceCtrl',
    function ($scope, $modalInstance, ServiceSubcategories, RatingTypes, Alerts, jobs) {

        $scope.alerts = Alerts;

        $scope.jobs = jobs;
        $scope.ratings = [];
        RatingTypes.query().$promise.then(function (types) {
            for (var i = 0; i < types.length; i++) {
                $scope.ratings.push({ _id: types[i]._id, name: types[i].name, description: types[i].description, rate: 0 });
            }
        });
        $scope.servicesubcategories = ServiceSubcategories.query();
        $scope.selectedservices = [];
        $scope.rate = 3;

        $scope.ok = function () {

            if ($scope.selectedservices.length) {
                if ($scope.comment) {

                    var reviewInfo = {
                        job: $scope.selectedJob && $scope.selectedJob._id ? $scope.selectedJob._id : null,
                        comment: $scope.comment,
                        selectedservices: $scope.selectedservices,
                        ratings: $scope.ratings
                    };

                    $modalInstance.close(reviewInfo);

                } else {
                    Alerts.show('danger', 'You must fill in a comment');
                }
            } else {
                Alerts.show('danger','You must select at least one service');
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
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