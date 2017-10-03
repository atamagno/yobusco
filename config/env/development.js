'use strict';

module.exports = {

	app: {
		title: 'Yo Busco - Development Environment',
		port: process.env.OPENSHIFT_NODEJS_PORT || 8002,
		server: process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'
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
		clientID: process.env.FACEBOOK_ID || '1408499079197694',
		clientSecret: process.env.FACEBOOK_SECRET || 'ba2d4e0612712d16d0e98fe3be0d46f4',
		callbackURL: '/api/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'BkHX1j8UHZquzEnJm9fUkQq41',
		clientSecret: process.env.TWITTER_SECRET || 'wqeauxdig0xVnMJudKRZaBi0bguIVZsgoWpbvxJPAG3XTnmzLR',
		callbackURL: '/api/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '780822628717-4ijcbdl0kgnt2n8q6r45t3kddh4tn7la.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'WIW-Y6dV7VyZtmjtWMBW7OKm',
		callbackURL: '/api/auth/google/callback'
	}
};
