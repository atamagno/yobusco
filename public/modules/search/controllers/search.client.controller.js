'use strict';

angular.module('search').controller('SearchController',
    function($scope, Authentication, ServiceSubcategoriesKeywords) {

        $scope.authentication = Authentication;
        $scope.serviceSubcategoriesKeywords = ServiceSubcategoriesKeywords.query();

        $scope.searchServiceSuppliers = function ($model)
        {
            /*
            ServiceSuppliers.searchBySubcategory($model.serviceSubcategoryId).then(function(serviceSuppliers)
            {
                $scope.serviceSuppliers = serviceSuppliers;
                // TODO: change route to home.results here?
            })
             */
        };
    });