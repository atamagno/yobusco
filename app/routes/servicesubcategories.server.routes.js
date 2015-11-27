'use strict';

module.exports = function(app) {
    var servicesubcategories = require('../../app/controllers/servicesubcategories.server.controller');

    // ServiceSubcategories Routes
    app.route('/servicesubcategories')
        .get(servicesubcategories.list)
        .post(servicesubcategories.create);

    app.route('/servicesubcategories/:servicesubcategoryId')
        .get(servicesubcategories.read)
        .put(servicesubcategories.update)
        .delete(servicesubcategories.delete);

    // Finish by binding the ServiceSubcategories middleware
    app.param('servicesubcategoryId', servicesubcategories.servicesubcategoryByID);

    // Just the keywords associated to each service subcategory
    app.route('/servicesubcategories-keywords').get(servicesubcategories.serviceSubcategoriesKeywords);

    app.route('/servicesubcategories-by-servicecategory/:serviceCategoryId').get(servicesubcategories.search);

    app.param('serviceCategoryId', servicesubcategories.serviceSubcategoriesByServiceCategory);

    app.route('/servicesubcategories/:currentPage/:itemsPerPage').get(servicesubcategories.listByPage);
};
