'use strict';

angular.module('messages')
	.factory('Messages',
		function($resource) {
			return $resource('messages/:conversationId', { conversationId: '@_id' }, { update: { method: 'PUT' } });
		})
	.factory('MessageSearch',
		function($resource) {
			return {
				messagesByUser: $resource('messages-by-user/:userId/:condition/:currentPage/:itemsPerPage', { userId: '@_id'},
					{
						'query':  { method: 'GET', isArray: false },
					}),
				unreadMessages: $resource('unread-messages-by-user/:userId', { userId: '@_id'},
					{
						'query':  { method: 'GET', isArray: false },
					})
			}
		});