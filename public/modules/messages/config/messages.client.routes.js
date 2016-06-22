'use strict';

// Setting up route
angular.module('messages').config(
	function($stateProvider) {

		$stateProvider.
			state('messages', {
				url: '/messages',
				templateUrl: 'modules/messages/views/messages.client.view.html',
			}).
			state('messages.list', {
				url: '/list/:condition/:currentPage',
				templateUrl: 'modules/messages/views/list-messages.client.view.html'
			}).
			state('messages.create', {
				url: '/create',
				templateUrl: 'modules/messages/views/create-message.client.view.html'
			}).
			state('messages.view', {
				url: '/view/:conversationId',
				templateUrl: 'modules/messages/views/view-message.client.view.html'
			});
	});
