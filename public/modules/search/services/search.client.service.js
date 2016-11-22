'use strict';

angular.module('search')
    .factory('ServiceSubcategoriesKeywords',
        function($resource)
        {
            return $resource('servicesubcategories-keywords').query();
        })
    .factory('ServiceSuppliersSearch',
        function($resource) {
            return $resource('servicesuppliers-results/:serviceId/:cityId/:currentPage/:itemsPerPage', null, {
                    'query':  { method: 'GET', isArray: false, params: { services: '', jobAmount: 0, supplierName: '', orderBy: '' } }
                });
        })
    .factory('ServiceSubcategoriesSearch',
        function($resource) {
            return $resource('servicesubcategories-by-servicecategory/:serviceCategoryId', {
                serviceCategoryId: '@_id'
            });
        });