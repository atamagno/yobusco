'use strict';

// ServiceSuppliers controller
angular.module('admin').controller('ServiceSuppliersController',
    function($scope, $stateParams, $state, $location, Authentication, ServiceSuppliers, ServiceSubcategories, $modal, Alerts) {
        $scope.authentication = Authentication;
        $scope.alerts = Alerts;

        $scope.createModalInstance = function (templateUrl) {

            var modalInstance = $modal.open({
                templateUrl: templateUrl,
                controller: 'ServiceSupplierModalInstanceCtrl'
            });

            return modalInstance;
        };

        $scope.openDeleteModal = function () {

            var modalInstance = $scope.createModalInstance('deleteServiceSupplierModal');
            modalInstance.result.then(function () {
                $scope.remove()
            });
        };

        $scope.openEditModal = function () {

            var modalInstance = $scope.createModalInstance('editServiceSupplierModal');
            modalInstance.result.then(function () {
                $scope.update()
            });
        };

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
                Alerts.show('success','Service supplier successfully created');
                $state.go('admin.viewServiceSupplier', { servicesupplierId: response._id});

                // Clear form fields
                $scope.display_name = '';
                $scope.phone_number = '';
                $scope.email = '';
                $scope.description = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                Alerts.show('danger',$scope.error);
            });
        };

        // Remove existing ServiceSupplier
        $scope.remove = function(servicesupplier) {
            $scope.servicesupplier.$remove(function() {
                Alerts.show('success','Service supplier successfully deleted');
                $state.go('admin.listServiceSuppliers');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                Alerts.show('danger',$scope.error);
            });
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
                Alerts.show('success','Service supplier successfully updated');
                $state.go('admin.viewServiceSupplier', { servicesupplierId: servicesupplier._id});
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                Alerts.show('danger',$scope.error);
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
        };
    });

angular.module('admin').controller('ServiceSupplierModalInstanceCtrl',
    function ($scope, $modalInstance) {

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });