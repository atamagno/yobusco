'use strict';

angular.module('search').controller('SearchController',
    function($scope, $location, $stateParams, Authentication, ServiceSubcategoriesKeywords, ServiceCategories, ServiceSuppliersSearch, ServiceSubcategoriesSearch) {

        $scope.authentication = Authentication;
        $scope.serviceSubcategoriesKeywords = ServiceSubcategoriesKeywords.query();
        $scope.serviceCategories = ServiceCategories.query();
        $scope.dropDownDisabled = true;
        $scope.selectedCategory = 'Service Categories';
        $scope.selectedSubCategoryName = 'Services';

        $scope.navigateToResults = function() {
            $location.path('servicesuppliers-search/' + $scope.selectedKeyword.serviceSubcategoryId + '/search');
        };

        $scope.getResults = function() {

            $scope.servicesuppliers = ServiceSuppliersSearch.query({
                serviceId: $stateParams.serviceId
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

        $scope.advancedSearchNavigateToResults = function() {
            if ($scope.selectedSubCategory) {
                $location.path('servicesuppliers-search/' + $scope.selectedSubCategory._id + '/search');
            }
        };
    });