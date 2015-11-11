'use strict';

angular.module('search')
    .factory('ServiceSubcategoriesKeywords',
        function($resource)
        {
            // console.log('executed!! - checking if service is called again');
            // TODO: what if the service returns no results? What should we do?
            // Since the route with this dependency won't be resolved...
            return $resource('servicesubcategories-keywords');
        })
    .factory('ServiceSuppliersSearch',
        function($resource) {
            return $resource('servicesuppliers-results/:serviceId/:currentPage/:itemsPerPage', null, {
                    'query':  { method: 'GET', isArray: false }
                });
        })
    .factory('ServiceSubcategoriesSearch',
        function($resource) {
            return $resource('servicesubcategories-by-servicecategory/:serviceCategoryId', {
                serviceCategoryId: '@_id'
            });
        });