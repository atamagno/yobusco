'use strict';

//ServiceSuppliers service used to communicate ServiceSuppliers REST endpoints
angular.module('servicesuppliers')
    .factory('ServiceSuppliers',
        function($resource) {
            return $resource('servicesuppliers/:servicesupplierId', { servicesupplierId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        });