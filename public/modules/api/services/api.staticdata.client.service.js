'use strict';

// Static data services used to get static information used from different sections of the app.

// Note: need to make sure this runs only once (e.g.: when accessing home?), and it is available through
// the whole application.... (maybe we need to move it somewhere else...)
// Check this: http://www.jvandemo.com/how-to-resolve-application-wide-resources-centrally-in-angularjs-with-ui-router/

angular.module('api').factory('ServiceSubcategoriesKeywords', ['$resource',
    function($resource)
    {
        // console.log('executed!! - checking if service is called again');
        // TODO: what if the service returns no results? What should we do?
        // Since the route with this dependency won't be resolved...
        return $resource('staticdata/servicesubcategories/keywords').query().$promise;
    }
]);

