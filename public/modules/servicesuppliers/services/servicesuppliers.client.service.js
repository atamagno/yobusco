'use strict';

angular.module('servicesuppliers')
    .factory('ServiceSuppliers',
        function($resource) {
            return $resource('servicesuppliers/:servicesupplierId', {
                servicesupplierId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        })
    .factory('ServiceSuppliersSearch',
        function($resource) {
            return $resource('servicesuppliers-results/:keyword', {
                keyword: '@_id'
            });
        });
