'use strict';

module.exports = function(app) {
    // Service Supplier Routes
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

    app.route('/servicesuppliers/:currentPage/:itemsPerPage').get(servicesuppliers.listByPage);

    app.param('servicesupplierId', servicesuppliers.servicesupplierByID);

    app.route('/servicesuppliers-results/:serviceId/:currentPage/:itemsPerPage').get(servicesuppliers.listByPage);
};
