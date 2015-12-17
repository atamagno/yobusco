'use strict';

angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies)
    .constant('AmazonS3', ApplicationConfiguration.amazonS3Config);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);

// Define the init function for starting up the application
angular.element(document).ready(function() {
    // Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    // Init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
