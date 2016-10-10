'use strict';

// ServiceSuppliers controller
angular.module('admin').controller('ServiceSuppliersController',
    function($scope, $stateParams, $state, $location, Authentication, ServiceSuppliersAdmin, ServiceSubcategories, Cities, $uibModal, Alerts) {
        $scope.authentication = Authentication;
        $scope.alerts = Alerts;

        // If user is not signed in then redirect back home
        if (!$scope.authentication.user || ($scope.authentication.user.roles.indexOf('admin') === -1)) $state.go('home');

        Cities.query().$promise.then(function (cities) {
            $scope.cities = cities;
            $scope.defaultLocation = cities[0];
        });

        $scope.changeLocation = function (city) {
            $scope.defaultLocation = city;
        };

        $scope.createModalInstance = function (templateUrl) {

            var modalInstance = $uibModal.open({
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
            var servicesupplier = new ServiceSuppliersAdmin ({
                firstName: this.firstName,
                lastName: this.lastName,
                username: this.username,
                password: this.password,
                roles: ['servicesupplier'],
                display_name: this.display_name,
                phone_number: this.phone_number,
                email: this.email,
                description: this.description,
                city: $scope.defaultLocation
            });

            servicesupplier.services = [];
            $scope.selectedservicesubcategories.forEach(function(service) {
                if (service.checked) {
                    servicesupplier.services.push(service._id);
                }
            });

            // Redirect after save
            servicesupplier.$save(function(response) {
                Alerts.show('success','Prestador de servicios creado exitosamente');
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
                Alerts.show('success','Prestador de servicios eliminado exitosamente');
                $scope.currentPage = 1;
                $scope.navigateToPage();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                Alerts.show('danger',$scope.error);
            });
        };

        // Update existing ServiceSupplier
        $scope.update = function() {
            var servicesupplier = $scope.servicesupplier;
            servicesupplier.city = $scope.defaultLocation;

            servicesupplier.services = [];
            $scope.selectedservicesubcategories.forEach(function(service) {
                if (service.checked) {
                    servicesupplier.services.push(service._id);
                }
            });

            servicesupplier.$update(function() {
                Alerts.show('success','Prestador de servicios actualizado exitosamente');
                $state.go('admin.viewServiceSupplier', { servicesupplierId: servicesupplier._id});
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                Alerts.show('danger',$scope.error);
            });
        };

        $scope.itemsPerPage = 5;
        $scope.maxPages = 5;
        $scope.showList = false;

        $scope.navigateToPage = function() {
            $state.go('admin.listServiceSuppliers', {
                currentPage: $scope.currentPage,
                itemsPerPage: $scope.itemsPerPage
            });
        };

        // Find a list of ServiceSuppliers
        $scope.find = function() {

            $scope.servicesuppliers = ServiceSuppliersAdmin.query({
                    currentPage: $stateParams.currentPage,
                    itemsPerPage: $stateParams.itemsPerPage
                }).$promise.then(function (response) {
                    $scope.currentPage = $stateParams.currentPage;
                    $scope.totalItems = response.totalItems;
                    $scope.servicesuppliers = response.servicesuppliers;
                    $scope.showList = $scope.totalItems > 0;
                });
        };

        // Find existing ServiceSupplier
        $scope.findOne = function() {
            ServiceSuppliersAdmin.get({
                servicesupplierId: $stateParams.servicesupplierId
            }).$promise.then(function(servicesupplier) {
                $scope.servicesupplier = servicesupplier;
                $scope.defaultLocation = servicesupplier.city;
                $scope.servicesubcategories = ServiceSubcategories.query();
                $scope.selectedservicesubcategories = [];
                $scope.servicesubcategories.$promise.then(function () {
                    $scope.servicesubcategories.forEach(function(service) {

                        var checked = false;
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
            });
        };
    });

angular.module('admin').controller('ServiceSupplierModalInstanceCtrl',
    function ($scope, $uibModalInstance) {

        $scope.ok = function () {
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });