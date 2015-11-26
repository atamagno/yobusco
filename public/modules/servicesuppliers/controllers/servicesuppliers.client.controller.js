'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersDetailController',
    function($scope, $stateParams, Authentication, ServiceSuppliersAdmin, ServiceSuppliersDetails) {
        $scope.authentication = Authentication;

        ServiceSuppliersAdmin.get({
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
    });