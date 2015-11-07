'use strict';

// ServiceSuppliers controller
angular.module('servicesuppliers').controller('ServiceSuppliersController',
    function($scope, $stateParams, $state, $location, Authentication, ServiceSuppliers, ServiceSubcategories) {
        $scope.authentication = Authentication;

        $scope.getServiceSubcategories = function() {
            $scope.servicesubcategories = ServiceSubcategories.query();
            $scope.selectedservicesubcategories = [];
            $scope.servicesubcategories.$promise.then(function () {
                $scope.servicesubcategories.forEach(function(service) {
                    $scope.selectedservicesubcategories.push({
                        _id: service._id,
                        name: service.name,
                        checked: false
                    });
                });
            });
        };

        // Create new ServiceSupplier
        $scope.create = function() {
            // Create new ServiceSupplier object
            var servicesupplier = new ServiceSuppliers ({
                display_name: this.display_name,
                phone_number: this.phone_number,
                email: this.email,
                description: this.description
            });

            servicesupplier.services = [];
            $scope.selectedservicesubcategories.forEach(function(service) {
                if (service.checked) {
                    servicesupplier.services.push(service._id);
                }
            });

            // Redirect after save
            servicesupplier.$save(function(response) {
                $state.go('admin.viewServiceSupplier', { servicesupplierId: response._id});

                // Clear form fields
                $scope.display_name = '';
                $scope.phone_number = '';
                $scope.email = '';
                $scope.description = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing ServiceSupplier
        $scope.remove = function(servicesupplier) {
            if ( servicesupplier ) {
                servicesupplier.$remove();

                for (var i in $scope.servicesuppliers) {
                    if ($scope.servicesuppliers [i] === servicesupplier) {
                        $scope.servicesuppliers.splice(i, 1);
                    }
                }
            } else {
                $scope.servicesupplier.$remove(function() {
                    $state.go('admin.listServiceSuppliers');
                });
            }
        };

        // Update existing ServiceSupplier
        $scope.update = function() {
            var servicesupplier = $scope.servicesupplier;

            servicesupplier.services = [];
            $scope.selectedservicesubcategories.forEach(function(service) {
                if (service.checked) {
                    servicesupplier.services.push(service._id);
                }
            });

            servicesupplier.$update(function() {
                $state.go('admin.viewServiceSupplier', { servicesupplierId: servicesupplier._id});
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of ServiceSuppliers
        $scope.find = function() {
            $scope.servicesuppliers = ServiceSuppliers.query();
        };

        // Find existing ServiceSupplier
        $scope.findOne = function() {
            ServiceSuppliers.get({
                servicesupplierId: $stateParams.servicesupplierId
            }).$promise.then(function(servicesupplier) {
                    $scope.servicesupplier = servicesupplier;

                    $scope.servicesubcategories = ServiceSubcategories.query();
                    $scope.selectedservicesubcategories = [];
                    $scope.servicesubcategories.$promise.then(function () {
                        $scope.servicesubcategories.forEach(function(service) {

                            var checked = false;
                            for (var i = 0; i < $scope.servicesupplier.services.length; i++) {
                                if ($scope.servicesupplier.services[i] === service._id) {
                                    checked = true;
                                    break;
                                }
                            }

                            $scope.selectedservicesubcategories.push({
                                _id: service._id,
                                name: service.name,
                                checked: checked
                            });
                        });
                    });
                });

            /*
            $scope.servicesubcategories = ServiceSubcategories.query();
            $scope.selectedservicesubcategories = [];
            $scope.servicesubcategories.$promise.then(function () {
                $scope.servicesubcategories.forEach(function(service) {

                    var checked = $scope.servicesupplier.services !== null;

                    for (var i = 0; i < $scope.servicesupplier.services.length; i++) {
                        if ($scope.servicesupplier.services[i]._id === service._id) {
                            checked = true;
                            break;
                        }
                    }


                    $scope.selectedservicesubcategories.push({
                        _id: service._id,
                        name: service.name,
                        checked: checked
                    });
                });
            });
            */

        };
    });