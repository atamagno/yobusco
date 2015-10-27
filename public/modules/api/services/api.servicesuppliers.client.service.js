// ServiceSuppliers service used to get service suppliers via the REST endpoint

angular.module('api').factory('ServiceSuppliers', ['$resource',
    function($resource) {

        var service = {};

        service.searchBySubcategory = function(subcategoryId){

            return $resource('servicesuppliers/' + subcategoryId).query().$promise;
        };

        return service;

    }
]);
