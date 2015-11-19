'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersDetailController',
    function($scope, Authentication) {
        $scope.authentication = Authentication;

        $scope.rate = 3;
        $scope.max = 5;

        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.max);
        };
    });