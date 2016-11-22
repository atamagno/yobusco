'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersReviewsController',
    function($scope, $state, $stateParams, ServiceSuppliersDetails) {

        $scope.itemsPerPage = 6;
        $scope.maxPages = 5;

        $scope.getReviewsForSupplier = function(){

            $scope.currentPage = $stateParams.currentPage;
            $scope.showList = false;
            ServiceSuppliersDetails.reviews.query({
                serviceSupplierId: $stateParams.servicesupplierId,
                currentPage: $scope.currentPage,
                itemsPerPage: $scope.itemsPerPage
            }).$promise.then(function (response) {
                    $scope.currentPage = $stateParams.currentPage;
                    $scope.jobs = response.jobs;
                    $scope.totalItems = response.totalItems;
                    $scope.showList = $scope.totalItems > 0;
                });
        };

        $scope.navigateToResults = function() {
            $state.go('servicesupplier.reviews', {
                currentPage: $scope.currentPage,
                itemsPerPage: $scope.itemsPerPage
            });
        };

    });

