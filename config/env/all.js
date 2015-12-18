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
				'public/libs/angular-animate/angular-animate.js',
				'public/libs/angular-resource/angular-resource.js',
				'public/libs/angular-ui-router/release/angular-ui-router.js',
				'public/libs/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/libs/angular-i18n/angular-locale_es-ar.js',
				'public/libs/ng-file-upload/ng-file-upload-shim.min.js',
				'public/libs/ng-file-upload/ng-file-upload.min.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/**/*.js'
		]
	}
};
