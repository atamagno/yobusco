'use strict';

module.exports = {

	app: {
		title: 'Yo Busco - Development Environment',
		port: process.env.OPENSHIFT_NODEJS_PORT || 8002,
		server: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
	},

	dbConnectionString : function()
	{
		return 'mongodb://localhost/yobusco';
	},

	mailer: {
		from: process.env.MAILER_FROM || 'sandbox5828bd2f4b634ad39b54049443bbdc6f.mailgun.org',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Mailgun',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'postmaster@sandbox5828bd2f4b634ad39b54049443bbdc6f.mailgun.org',
				pass: process.env.MAILER_PASSWORD || '0869030670e24a94af7c440353c926f9'
			}
		}
	},

	facebook: {
		clientID: process.env.FACEBOOK_ID || '174758279535102',
		clientSecret: process.env.FACEBOOK_SECRET || '3c8f18ba583b7ef8ed824294bf8f1fa6',
		callbackURL: '/api/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'xTLBmuY3rXQ8mtAFa6gOKE25u',
		clientSecret: process.env.TWITTER_SECRET || 'fooZUIveUSQd08WniKHyxX7hqljq45GQ8dSJQbxefCNIaMKdq7',
		callbackURL: '/api/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '911740617183-b7dcaqpkg5dkcffr60pdrtm4nk78hlvj.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || '7TKdgia0Xi3iNdt-jnww2-UV',
		callbackURL: '/api/auth/google/callback'
	}
};
