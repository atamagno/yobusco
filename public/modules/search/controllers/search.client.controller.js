'use strict';

angular.module('search').controller('SearchController',
    function($scope, $location, $stateParams, Authentication, ServiceSubcategoriesKeywords, ServiceSuppliersSearch) {

        $scope.authentication = Authentication;
        $scope.serviceSubcategoriesKeywords = ServiceSubcategoriesKeywords.query();

        $scope.navigateToResults = function() {
            $location.path('servicesuppliers-search/' + $scope.selectedSubcategory.serviceSubcategoryId + '/search');
        };

        $scope.getResults = function() {

            $scope.servicesuppliers = ServiceSuppliersSearch.query({
                serviceId: $stateParams.serviceId
            });
        };
    });