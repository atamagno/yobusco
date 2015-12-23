'use strict';

// Separating search vs. user specific services - testing something...
angular.module('admin').factory('UsersAdminSearch',
	function($resource) {

		return $resource('users-admin/search',null,
			{
				query: { method: 'GET', isArray: false,
						 params: {username: '', firstname: '', lastname: '', email: '', city: ''}
				}
			}
		);
	});

angular.module('admin').factory('UsersAdminUser',

	function($resource) {

		return $resource('users-admin/user/:userId', {userId: '@_id'},
			{
				query: {method: 'GET', isArray: false},
				update: {method: 'PUT'}

			}
		);
	});