'use strict';

module.exports = function(app) {
    // Service Supplier Routes
    var servicesuppliers = require('../../app/controllers/servicesuppliers.server.controller');

    // Setting up the service suppliers search api
    app.route('/servicesuppliers/:servicesubcategory').get(servicesuppliers.serviceSuppliersBySubcategory);
};
