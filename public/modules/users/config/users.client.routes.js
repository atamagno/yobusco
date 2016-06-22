'use strict';

// Setting up route
angular.module('users').config(
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/profile.client.view.html'
		}).
		state('profile.user', {
			url: '/settings/profile/user',
			templateUrl: 'modules/users/views/settings/user-profile.client.view.html'
		}).
		state('profile.serviceSupplier', {
			url: '/settings/profile/service-supplier',
			templateUrl: 'modules/users/views/settings/servicesupplier-profile.client.view.html'
		}).
		state('profile-edit-user', {
			url: '/settings/profile/edit-user',
			templateUrl: 'modules/users/views/settings/edit-user-profile.client.view.html'
		}).
		state('profile-edit-servicesupplier', {
			url: '/settings/profile/edit-service-supplier',
			templateUrl: 'modules/users/views/settings/edit-servicesupplier-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin?err',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	});