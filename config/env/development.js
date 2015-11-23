'use strict';

module.exports = {

	app: {
		title: 'Yo Busco - Development Environment',
		port: process.env.OPENSHIFT_NODEJS_PORT || 8002,
		server: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
	},

	db: {
		port: process.env.OPENSHIFT_MONGODB_DB_PORT || '27017',
		server: process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1',
		user: process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'admin',
		password: process.env.OPENSHIFT_MONGODB_DB_PASSWORD || 'Ge1uvfKuM8cz',
		database: 'yobusco',
	},

	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'yo.busco.test@gmail.com',
				pass: process.env.MAILER_PASSWORD || 'Yobusco1234'
			}
		}
	},

	dbConnectionString : function()
	{
		// should return 'mongodb://user:password@server:port
		return 'mongodb://localhost/yobusco';
		//return 'mongodb://' + this.db.user + ':' + this.db.password + '@' + this.db.server + ':' + this.db.port + '/'  + this.db.database
	}
};
