'use strict';

angular.module('search').controller('SuppliersSearchController',
    function($scope, $state, Authentication, ServiceSubcategoriesKeywords, ServiceCategories, ServiceSubcategoriesSearch) {

        $scope.authentication = Authentication;
        $scope.serviceSubcategoriesKeywords = ServiceSubcategoriesKeywords.query();
        $scope.serviceCategories = ServiceCategories.query();
        $scope.dropDownDisabled = true;
        $scope.selectedCategory = 'Service Categories';
        $scope.selectedSubCategoryName = 'Services';

        $scope.currentPage = 1;
        $scope.itemsPerPage = 5;

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

        $scope.navigateToResults = function() {
            $state.go('resultsServiceSupplier.list', {
                serviceId: $scope.serviceSubcategoryId,
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