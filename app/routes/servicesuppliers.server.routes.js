'use strict';

/**
 * Module dependencies.
 */
// var passport = require('passport');

module.exports = function(app) {
    // User Routes
    var servicesuppliers = require('../../app/controllers/servicesuppliers.server.controller');

    // Setting up the service suppliers search api
    app.route('/servicesuppliers/:servicesubcategory').get(servicesuppliers.serviceSuppliersBySubcategory);

    // app.route('/users').put(users.update);

    // Setting up the users password api
    // app.route('/users/password').post(users.changePassword);
    // app.route('/auth/forgot').post(users.forgot);
    // app.route('/auth/reset/:token').get(users.validateResetToken);
    // app.route('/auth/reset/:token').post(users.reset);

    // Setting up the users authentication api
    // app.route('/auth/signup').post(users.signup);
    // app.route('/auth/signin').post(users.signin);
    // app.route('/auth/signout').get(users.signout);

    // Finish by binding the user middleware
    // app.param('userId', users.userByID);
};
