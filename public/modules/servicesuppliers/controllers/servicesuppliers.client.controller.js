'use strict';

angular.module('servicesuppliers').controller('ServiceSuppliersController',
    function($scope, $stateParams, $location, ServiceSuppliers, ServiceSuppliersSearch, Authentication) {

        $scope.authentication = Authentication;

        $scope.create = function() {
            var servicesupplier = new ServiceSuppliers({
                name: this.name,
                city: this.city,
                phone: this.phone,
                generalDescription: this.generalDescription
            });

            servicesupplier.$save(function(response) {
                $location.path('servicesuppliers/' + response._id);

                $scope.name = '';
                $scope.city = '';
                $scope.phone = '';
                $scope.generalDescription = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function(servicesupplier) {
            if (servicesupplier) {
                servicesupplier.$remove();

                for (var i in $scope.servicesuppliers) {
                    if ($scope.servicesuppliers[i] === servicesupplier) {
                        $scope.servicesuppliers.splice(i, 1);
                    }
                }
            } else {
                $scope.servicesupplier.$remove(function() {
                    $location.path('servicesuppliers');
                });
            }
        };

        $scope.update = function() {
            var servicesupplier = $scope.servicesupplier;

            servicesupplier.$update(function() {
                $location.path('servicesuppliers/' + servicesupplier._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.addReview = function() {
            if (this.comment) {

                var servicesupplier = $scope.servicesupplier;

                servicesupplier.$update({ comment: this.comment }, function() {
                    $scope.comment = '';
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        $scope.find = function() {
            $scope.servicesuppliers = ServiceSuppliers.query();
        };

        $scope.findOne = function() {
            $scope.servicesupplier = ServiceSuppliers.get({
                servicesupplierId: $stateParams.servicesupplierId
            });
        };

        $scope.navigateToResults = function() {
            $location.path('servicesuppliers-search/' + $scope.keyword + '/search');
        };

        $scope.getResults = function() {

            $scope.servicesuppliers = ServiceSuppliersSearch.query({
                keyword: $stateParams.keyword
            });
        };
    });
