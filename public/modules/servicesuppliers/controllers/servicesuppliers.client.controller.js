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
                    },
                    servicesupplier: function() {return $scope.servicesupplier},
                    authentication: function(){return $scope.authentication}
                }
            });


            modalInstance.result.then(function (review) {
                $scope.reviews.splice(0, 0, review);
                review.user.displayName = $scope.authentication.user.displayName;
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
    function ($scope, $uibModalInstance, RatingTypes, Alerts, Reviews, jobs, servicesupplier, authentication) {

        $scope.alerts = Alerts;

        $scope.jobs = jobs;

        // TODO: can we add the rating types in the resolve collection of the modal (just like jobs & supplier services)
        // so we don't hit the server for each time the modal is opened?
        // Check this: http://www.bennadel.com/blog/2782-route-resolution-using-factory-functions-vs-services-in-angularjs.htm
        // And this commit for an example that was used for service subcategories keywords:
        // https://github.com/atamagno/yobusco/commit/e42a553c87e288a813f336748ee68204e895018a
        $scope.ratings = [];
        RatingTypes.query().$promise.then(function (types) {
            for (var i = 0; i < types.length; i++) {
                $scope.ratings.push({ _id: types[i]._id, name: types[i].name, description: types[i].description, rate: 3 });
            }
        });

        $scope.servicesubcategories = servicesupplier.services;
        $scope.selectedservices = [];
        $scope.rate = 3;

        $scope.ok = function () {

            if ($scope.selectedservices.length) {
                if ($scope.comment) {

                    var reviewInfo = {
                        job: $scope.selectedJob && $scope.selectedJob._id ? $scope.selectedJob._id : null,
                        comment: $scope.comment,
                        selectedservices: $scope.selectedservices,
                        ratings: $scope.ratings,
                        recommend: $scope.recommend
                    };

                    $scope.addReview(reviewInfo)

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
                service_supplier: servicesupplier._id,
                user: authentication.user._id,
                services: services,
                ratings: ratings,
                recommend: reviewInfo.recommend
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