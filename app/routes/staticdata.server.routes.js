
'use strict';

/**
 * Module dependencies.
 */


module.exports = function(app) {

    // Static data Routes
    var staticData = require('../../app/controllers/staticdata.server.controller');

    // Setting up the different routes to get static data.

    // Service subcategories
    app.route('/staticdata/servicesubcategories').get(staticData.serviceSubcategories);


    // Just the keywords associated to each service subcategory
    app.route('/staticdata/servicesubcategories/keywords').get(staticData.serviceSubcategoriesKeywords);

};
