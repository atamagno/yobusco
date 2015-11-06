'use strict';

module.exports = function(app) {
    // Service Supplier Routes
    var servicesuppliers = require('../../app/controllers/servicesuppliers.server.controller');

    var users = require('../../app/controllers/users.server.controller');
    var servicesuppliers = require('../../app/controllers/servicesuppliers.server.controller');

    // ServiceSuppliers Routes
    app.route('/servicesuppliers')
        .get(servicesuppliers.list)
        .post(users.requiresLogin, servicesuppliers.create);

    app.route('/servicesuppliers/:servicesupplierId')
        .get(servicesuppliers.read)
        .put(users.requiresLogin, servicesuppliers.update)
        .delete(users.requiresLogin, servicesuppliers.delete);

    // Finish by binding the Servicesupplier middleware
    app.param('servicesupplierId', servicesuppliers.servicesupplierByID);
};
