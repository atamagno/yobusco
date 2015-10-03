'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var servicesuppliers = require('../../app/controllers/servicesuppliers.server.controller');

	app.route('/servicesuppliers')
			.get(servicesuppliers.list)
			.post(users.requiresLogin, servicesuppliers.create);

	app.route('/servicesuppliers/:servicesuppliersId')
		.get(servicesuppliers.read)
		.put(users.requiresLogin, servicesuppliers.hasAuthorization, servicesuppliers.update)
		.delete(users.requiresLogin, servicesuppliers.hasAuthorization, servicesuppliers.delete);

	app.param('servicesuppliersId', servicesuppliers.servicesupplierByID);

	app.route('/servicesuppliers-results/:keyword')
		.get(servicesuppliers.search);

	app.param('keyword', servicesuppliers.servicesuppliersByKeyword);
};
