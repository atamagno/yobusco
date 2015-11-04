'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersController',
    function($scope, Authentication, ServiceSubcategoriesKeywords) {

        $scope.authentication = Authentication;
        $scope.serviceSubcategoriesKeywords = ServiceSubcategoriesKeywords;

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
