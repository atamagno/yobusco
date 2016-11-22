'use strict';

angular.module('search').controller('SuppliersSearchController',
    function($scope, $state, Authentication, ServiceSubcategoriesKeywords, ServiceCategories, ServiceSubcategoriesSearch, Cities) {

        $scope.authentication = Authentication;
        $scope.serviceSubcategoriesKeywords = ServiceSubcategoriesKeywords;
        $scope.serviceCategories = ServiceCategories.query();
        $scope.dropDownDisabled = true;
        $scope.selectedCategory = 'Categorias de Servicios';
        $scope.selectedSubCategoryName = 'Servicios';

        $scope.currentPage = 1;
        $scope.itemsPerPage = 5;

        Cities.query().$promise.then(function (cities) {
            $scope.cities = cities;
            $scope.defaultLocation = cities[0];
        });

        $scope.changeLocation = function (city) {
            $scope.defaultLocation = city;
        };

        $scope.navigateToResultsFromKeywordSearch = function() {
            if ($scope.selectedKeyword && $scope.selectedKeyword.serviceSubcategoryId) {
                $scope.serviceSubcategoryId = $scope.selectedKeyword.serviceSubcategoryId;
                $scope.navigateToResults();
            }
        };

        $scope.navigateToResultsFromAdvancedSearch = function() {
            if ($scope.selectedSubCategory && $scope.selectedSubCategory._id) {
                $scope.serviceSubcategoryId = $scope.selectedSubCategory._id;
                $scope.navigateToResults();
            }
        };

        $scope.navigateToResults = function(serviceSubcategoryId) {

            if (!serviceSubcategoryId)
            {
                serviceSubcategoryId = $scope.serviceSubcategoryId;
            }

            $state.go('resultsServiceSupplier.list', {
                serviceId: serviceSubcategoryId,
                cityId: $scope.defaultLocation._id,
                currentPage: $scope.currentPage,
                itemsPerPage: $scope.itemsPerPage
            });
        };

        $scope.selectCategory = function(serviceCategory) {
            $scope.selectedCategory = serviceCategory.name;

            $scope.serviceSubcategories = ServiceSubcategoriesSearch.query({
                serviceCategoryId: serviceCategory._id
            });

            $scope.dropDownDisabled = false;
        }

        $scope.selectSubCategory = function(serviceSubCategory) {
            $scope.selectedSubCategoryName = serviceSubCategory.name;
            $scope.selectedSubCategory = serviceSubCategory;
        }
    });