'use strict';

//ServiceSuppliers service used to communicate ServiceSuppliers REST endpoints
angular.module('admin')
    .factory('ServiceSuppliers',
        function($resource) {
            return $resource('servicesuppliers/:servicesupplierId');
        })
    .factory('ServiceSuppliersAdmin',
        function($resource) {
            return $resource('servicesuppliers-admin/:servicesupplierId/:currentPage/:itemsPerPage', { servicesupplierId: '@_id'
            }, {
                query:  { method: 'GET', isArray: false },
                update: { method: 'PUT' }
            });
        });