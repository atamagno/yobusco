'use strict';

module.exports = function(app) {
    var servicesubcategories = require(__base + 'app/controllers/servicesubcategories.server.controller'),
        users = require(__base  + 'app/controllers/users.server.controller');

    // ServiceSubcategories admin routes
    app.route('/servicesubcategories-admin')
        .get(servicesubcategories.list)
        .post(users.requiresLogin, users.isAdmin, servicesubcategories.create);

    app.route('/servicesubcategories-admin/:servicesubcategoryId')
        .get(servicesubcategories.read)
        .put(users.requiresLogin, users.isAdmin, servicesubcategories.update)
        .delete(users.requiresLogin, users.isAdmin, servicesubcategories.delete);

    app.param('servicesubcategoryId', servicesubcategories.servicesubcategoryByID);

    app.route('/servicesubcategories-admin/:currentPage/:itemsPerPage').get(servicesubcategories.listByPage);

    // ServiceSubcategories routes
    app.route('/servicesubcategories').get(servicesubcategories.list);
    app.route('/servicesubcategories-keywords').get(servicesubcategories.serviceSubcategoriesKeywords);
    app.route('/servicesubcategories-by-servicecategory/:serviceCategoryId').get(servicesubcategories.search);
    app.param('serviceCategoryId', servicesubcategories.serviceSubcategoriesByServiceCategory);
};
