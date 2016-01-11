'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersDetailController',
    function($scope, $state, $stateParams, Authentication, ServiceSuppliers, ServiceSuppliersDetails, Reviews, Alerts, $uibModal) {
        $scope.authentication = Authentication;

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
                resolve: {
                    jobs: function () {
                        var finishedJobs = [];
                        for (var i = 0; i < $scope.jobs.length; i++) {
                            if ($scope.jobs[i].status.finished) {
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
            review.$save(function (review) {
                review.user.displayName = $scope.authentication.user.displayName;
                $scope.reviews.splice(0, 0, review);
                $scope.servicesupplier.overall_rating = $scope.updateOverallRating();
                Alerts.show('success','Comentario agregado exitosamente');
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
                Alerts.show('danger', $scope.error);
            });

        };

        $scope.updateOverallRating = function() {

            var ratingsAvgSum = 0;
            $scope.reviews.forEach(function(review) {
                    ratingsAvgSum+= parseFloat(review.ratingsAvg);
            })
            return (ratingsAvgSum / $scope.reviews.length).toFixed(2);
        }
    });

angular.module('servicesuppliers').controller('SupplierReviewModalInstanceCtrl',
    function ($scope, $uibModalInstance, ServiceSubcategories, RatingTypes, Alerts, jobs) {

        $scope.alerts = Alerts;

        $scope.jobs = jobs;
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

            if ($scope.selectedservices.length) {
                if ($scope.comment) {

                    var reviewInfo = {
                        job: $scope.selectedJob && $scope.selectedJob._id ? $scope.selectedJob._id : null,
                        comment: $scope.comment,
                        selectedservices: $scope.selectedservices,
                        ratings: $scope.ratings
                    };

                    $uibModalInstance.close(reviewInfo);

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

            $scope.selected = '';
        };

        $scope.deleteSelectedService = function(index) {
            $scope.selectedservices.splice(index, 1);
        };
    });