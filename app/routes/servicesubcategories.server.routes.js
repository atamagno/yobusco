
'use strict';

/**
 * Module dependencies.
 */


module.exports = function(app) {

    // Static data Routes
    var servicesubcategories = require('../../app/controllers/servicesubcategories.server.controller');

    // Setting up the different routes to get static data.

    // Service subcategories
    app.route('/servicesubcategories').get(servicesubcategories.serviceSubcategories);

    // Just the keywords associated to each service subcategory
    app.route('/servicesubcategories/keywords').get(servicesubcategories.serviceSubcategoriesKeywords);
};
