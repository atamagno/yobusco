'use strict';

angular.module('search').controller('SuppliersResultsController',
    function($scope, $state, $stateParams, Authentication, ServiceSuppliersSearch) {

        $scope.authentication = Authentication;
        $scope.serviceSubcategoryId = $stateParams.serviceId;

        // TODO: we need to increment this number, maybe between 10-20?
        // We keep it low for now just for testing purposes due to the few suppliers in the data base.
        $scope.itemsPerPage = 2;
        $scope.maxPages = 5;
        $scope.showList = false;

        $scope.navigateToResults = function() {
            $state.go('resultsServiceSupplier.list', {
                serviceId: $scope.serviceSubcategoryId,
                currentPage: $scope.currentPage,
                itemsPerPage: $scope.itemsPerPage
            });
        };

        $scope.getResults = function() {
            $scope.showList = false;
            ServiceSuppliersSearch.query({
                serviceId: $stateParams.serviceId,
                currentPage: $stateParams.currentPage,
                itemsPerPage: $stateParams.itemsPerPage
            }).$promise.then(function (response) {
                $scope.currentPage = $stateParams.currentPage;
                $scope.totalItems = response.totalItems;
                $scope.servicesuppliers = response.servicesuppliers;
                $scope.showList = $scope.totalItems > 0;
            });
        };
    });