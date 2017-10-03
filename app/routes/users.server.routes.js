'use strict';

module.exports = function(app) {
	var users = require(__base + 'app/controllers/users.server.controller');

	// Setting up the users admin api
	app.route('/users-admin')
		.get(users.list) // TODO: protect this route with login too
		.post(users.requiresLogin, users.isAdmin, users.create);

	app.route('/users-admin/:userId')
		.get(users.read) // TODO: protect this route with login too
		.put(users.requiresLogin, users.isAdmin, users.updateForAdmin)
		.delete(users.requiresLogin, users.isAdmin, users.delete);

	app.param('userId', users.userForAdminByID);
	
	app.route('/users-admin/:currentPage/:itemsPerPage').get(users.listByPage); // TODO: this probably requires admin login too

	app.route('/user-by-username/:userName').get(users.findByUserName); // // TODO: this probably requires login too

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users')
		.get(users.list) // TODO: this probably requires login too
		.put(users.requiresLogin, users.update);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	// Setting the facebook oauth routes
	app.route('/api/auth/facebook').get(users.oauthCall('facebook', {
		scope: ['email', 'user_location']
	}));
	app.route('/api/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the twitter oauth routes
	app.route('/api/auth/twitter').get(users.oauthCall('twitter'));
	app.route('/api/auth/twitter/callback').get(users.oauthCallback('twitter'));

	// Setting the google oauth routes
	app.route('/api/auth/google').get(users.oauthCall('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/plus.me'
		]
	}));
	app.route('/api/auth/google/callback').get(users.oauthCallback('google'));
};