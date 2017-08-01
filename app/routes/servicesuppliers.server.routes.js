'use strict';

module.exports = function(app) {
    var servicesuppliers = require(__base + 'app/controllers/servicesuppliers.server.controller'),
        users = require(__base + 'app/controllers/users.server.controller');

    // TODO: protect these routes with login here, as appropriate...

    // ServiceSuppliers admin routes
    app.route('/servicesuppliers-admin')
        .get(servicesuppliers.list)
        .post(users.requiresLogin, users.isAdmin, servicesuppliers.create);

    app.route('/servicesuppliers-admin/:servicesupplierId')
        .get(servicesuppliers.read)
        .put(users.requiresLogin, users.isAdmin, servicesuppliers.update)
        .delete(users.requiresLogin, users.isAdmin, servicesuppliers.delete);

    app.route('/servicesuppliers-admin/:currentPage/:itemsPerPage').get(servicesuppliers.listByPage);

    app.param('servicesupplierId', servicesuppliers.serviceSupplierByID);

    //ServiceSuppliers routes
    app.route('/servicesuppliers').get(servicesuppliers.list)
    app.route('/servicesuppliers/:servicesupplierId')
        .get(servicesuppliers.read)
        .put(users.requiresLogin, servicesuppliers.update);

    app.route('/servicesuppliers-results/:serviceId/:cityId/:currentPage/:itemsPerPage').get(servicesuppliers.listByPage);
    app.route('/servicesupplier-by-user/:userId').get(servicesuppliers.serviceSupplierByUserID);
    app.route('/servicesupplier-by-username/:userName').get(servicesuppliers.serviceSupplierByUsername);
};
