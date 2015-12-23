'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'ManoDeObra';
	
	var applicationModuleVendorDependencies = ['ngResource', 'ui.router', 'ngAnimate', 'ui.bootstrap', 'ngFileUpload', 'angularUtils.directives.dirPagination'];
	var amazonS3Config = {
		url: 'https://yobusco-bucket.s3.amazonaws.com/', // S3 upload url including bucket name
		bucketUrl: 'https://s3-sa-east-1.amazonaws.com/yobusco-bucket/',
		AWSAccessKeyId: 'AKIAI2GMLNIOKFL7H4XA',
		acl: 'private', // sets the access to the uploaded file in the bucket: private, public-read, ...
		policy: 'ewogICJleHBpcmF0aW9uIjogIjIwMjAtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogInlvYnVzY28tYnVja2V0In0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRrZXkiLCAiIl0sCiAgICB7ImFjbCI6ICJwcml2YXRlIn0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRDb250ZW50LVR5cGUiLCAiIl0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRmaWxlbmFtZSIsICIiXSwKICAgIFsiY29udGVudC1sZW5ndGgtcmFuZ2UiLCAwLCA1MjQyODgwMDBdCiAgXQp9', // base64-encoded json policy
		signature: 'vD6ZzelepyTvIvnvG93lXoXWAOI=', // base64-encoded signature based on policy string
	};

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		amazonS3Config: amazonS3Config,
		registerModule: registerModule
	};
})();