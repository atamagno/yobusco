'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersJobsController',
    function($scope, $state, $stateParams, ServiceSuppliersDetails) {

        $scope.itemsPerPage = 6;
        $scope.maxPages = 5;

        $scope.showUser = true;
        $scope.showServiceSupplier = false;

        $scope.getJobsForSupplier = function(){

            $scope.currentPage = $stateParams.currentPage;
            $scope.showList = false;
            ServiceSuppliersDetails.jobs.query({
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

        $scope.navigateToJobDetails = function (jobId) {
            $state.go('jobs.viewDetail', { jobId: jobId});
        };

        $scope.navigateToResults = function() {
            $state.go('servicesupplier.jobs', {
                currentPage: $scope.currentPage,
                itemsPerPage: $scope.itemsPerPage
            });
        };


    });

