'use strict';

angular.module('servicesuppliers')
    .factory('ServiceSubcategoriesKeywords',
        function($resource)
        {
            // console.log('executed!! - checking if service is called again');
            // TODO: what if the service returns no results? What should we do?
            // Since the route with this dependency won't be resolved...
            return $resource('servicesubcategories/keywords').query().$promise;
        });
