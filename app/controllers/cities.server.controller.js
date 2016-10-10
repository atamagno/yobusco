'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	City = mongoose.model('City'),
	_ = require('lodash');

/**
 * Show the current City
 */
exports.read = function(req, res) {
	res.jsonp(req.city);
};

/**
 * List of Cities
 */
exports.list = function(req, res) {
	City.find().exec(function(err, cities) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(cities);
		}
	});
};

/**
 * City middleware
 */
exports.cityByID = function(req, res, next, id) {
	City.findById(id).exec(function(err, city) {
		if (err) return next(err);
		if (!city) return next(new Error('Error al cargar ciudad ' + id));
		req.city = city;
		next();
	});
};