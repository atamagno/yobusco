'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
	User.findOne({
		_id: id
	}).exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Error al cargar usuario ' + id));
		req.profile = user;
		next();
	});
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'El usuario no est\u00e1 logueado'
		});
	}

	next();
};

/**
 * Admin authorization routing middleware
 */
exports.isAdmin = function(req, res, next) {
	if (!_.intersection(req.user.roles, ['admin']).length) {
		return res.status(403).send({
			message: 'El usuario no est\u00e1 autorizado'
		});
	}
	next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
	var _this = this;

	return function(req, res, next) {
		_this.requiresLogin(req, res, function() {
			if (_.intersection(req.user.roles, roles).length) {
				return next();
			} else {
				return res.status(403).send({
					message: 'El usuario no est\u00e1 autorizado'
				});
			}
		});
	};
};