'use strict';

module.exports = {

	app: {
		title: 'yobusco',
		description: 'Test description.',
		keywords: 'yobusco, mean, mongo, express, angular, node'
	},

	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/libs/bootstrap/dist/css/bootstrap.css',
				'public/libs/bootstrap/dist/css/bootstrap-theme.css'
			],
			js: [
				'public/libs/angular/angular.js',
				'public/libs/angular-resource/angular-resource.js',
				'public/libs/angular-ui-router/release/angular-ui-router.js',
				'public/libs/angular-bootstrap/ui-bootstrap-tpls.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			//'public/modules/api/api.client.module.js', // test to verify if order of modules matters
			//'public/modules/api/*/*.js',               // due to dependencies...
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		]
	}
};
