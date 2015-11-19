'use strict';

//ServiceSuppliers service used to communicate ServiceSuppliers REST endpoints
angular.module('admin')
    .factory('ServiceSuppliers',
        function($resource) {
            return $resource('servicesuppliers/:servicesupplierId/:currentPage/:itemsPerPage', { servicesupplierId: '@_id'
            }, {
                update: { method: 'PUT' }
            });
        })
    .factory('ServiceSuppliersAdmin',
        function($resource) {
            return $resource('servicesuppliers/:servicesupplierId/:currentPage/:itemsPerPage', { servicesupplierId: '@_id'
            }, {
                query:  { method: 'GET', isArray: false },
                update: { method: 'PUT' }
            });
        });