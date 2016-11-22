'use strict';

angular.module('search')
    .controller('SuppliersResultsController',
        function($scope, $state, $stateParams, Authentication, ServiceSuppliersSearch, Alerts) {

            $scope.alerts = Alerts;
            $scope.authentication = Authentication;
            $scope.serviceSubcategoryId = $stateParams.serviceId;

            // TODO: we need to increment this number, maybe between 10-20?
            // We keep it low for now just for testing purposes due to the few suppliers in the data base.
            $scope.itemsPerPage = 5;
            $scope.maxPages = 5;
            $scope.showList = false;

            $scope.navigateToResults = function() {
                $state.go('resultsServiceSupplier.list', {
                    serviceId: $scope.serviceSubcategoryId,
                    cityId: $scope.defaultLocation._id,
                    currentPage: $scope.currentPage,
                    itemsPerPage: $scope.itemsPerPage
                });
            };

            $scope.orderOptions = [
                {name:'Rating', value: 'rating'},
                {name:'Cantidad de trabajos', value: 'jobCount'},
                {name:'Miembro desde', value: 'memberSince'},
                {name:'Nombre', value: 'name'}
            ];

            if ($stateParams.orderBy) {
                var selectedOrderOptions = $scope.orderOptions.filter(filterOrderOption);
                if (selectedOrderOptions.length == 1) {
                    $scope.orderBy = selectedOrderOptions[0];
                }
            } else {
                $scope.orderBy = $scope.orderOptions[0];
            }

            function filterOrderOption(orderOption) {
                return orderOption.value == $stateParams.orderBy;
            }

            $scope.orderResults = function() {
                $state.go('resultsServiceSupplier.list', {
                    serviceId: $scope.serviceSubcategoryId,
                    cityId: $scope.defaultLocation._id,
                    currentPage: 1,
                    itemsPerPage: $scope.itemsPerPage,
                    orderBy: $scope.orderBy.value
                });
            };

            $scope.getResults = function() {
                $scope.showList = false;
                ServiceSuppliersSearch.query({
                    serviceId: $stateParams.serviceId,
                    cityId: $stateParams.cityId,
                    currentPage: $stateParams.currentPage,
                    itemsPerPage: $stateParams.itemsPerPage,
                    services: $stateParams.services,
                    jobAmount: $stateParams.jobAmount,
                    supplierName: $stateParams.supplierName,
                    orderBy: $stateParams.orderBy
                }).$promise.then(function (response) {
                    $scope.currentPage = $stateParams.currentPage;
                    $scope.totalItems = response.totalItems;
                    $scope.servicesuppliers = response.servicesuppliers;
                    // TODO: add points and category to search results-list.client.view
                    // Potentially use ng-class to override the frame border color (list-group-item) + display category icon?
                    // Override background-color too?
                    $scope.showList = $scope.totalItems > 0;
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                    Alerts.show('danger', $scope.error);
                });
            };
        })
    .controller('SuppliersFiltersController',
        function($scope, $state, $stateParams, ServiceSubcategories, RatingTypes, ServiceSuppliersSearch, Cities) {

            $scope.jobAmount = 0;
            $scope.serviceSubcategoryId = $stateParams.serviceId;
            $scope.itemsPerPage = 5;

            Cities.query().$promise.then(function (cities) {
                $scope.cities = cities;

                for (var i = 0; i < cities.length; i++) {
                    if (cities[i]._id == $stateParams.cityId) {
                        $scope.defaultLocation = cities[i];
                        break;
                    }
                }
            });

            $scope.changeLocation = function (city) {
                $scope.defaultLocation = city;
            };

            $scope.serviceSubcategories = [];
            ServiceSubcategories.query().$promise.then(function (services) {
                for (var i = 0; i < services.length; i++) {
                    $scope.serviceSubcategories.push({_id: services[i]._id, name: services[i].name, checked: false });
                }
            });

            $scope.ratings = [];
            RatingTypes.query().$promise.then(function (types) {
                for (var i = 0; i < types.length; i++) {
                    $scope.ratings.push({ _id: types[i]._id, name: types[i].name, description: types[i].description, rate: 0 });
                }
            });

            $scope.applyFilters = function() {

                var services = '';
                $scope.serviceSubcategories.forEach(function(service) {
                    if (service.checked) {
                        if (services.length) {
                            services += '%';
                        }
                        services += service._id;
                    }
                });

                $state.go('resultsServiceSupplier.list', {
                    serviceId: $scope.serviceSubcategoryId,
                    cityId: $scope.defaultLocation._id,
                    currentPage: 1,
                    itemsPerPage: $scope.itemsPerPage,
                    services: services,
                    jobAmount: $scope.jobAmount,
                    supplierName: $scope.supplierName
                });
            };

            $scope.resetFilters = function() {

                $scope.jobAmount = 0;
                $scope.supplierName = '';
                $scope.serviceSubcategories.forEach(function(service) {
                    service.checked = false;
                });

                $state.go('resultsServiceSupplier.list', {
                    serviceId: $scope.serviceSubcategoryId,
                    currentPage: 1,
                    itemsPerPage: $scope.itemsPerPage,
                    services: '',
                    jobAmount: '',
                    supplierName: ''
                }, {reload: true});
            };
        });