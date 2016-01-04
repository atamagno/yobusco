'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * Create a User
 */
exports.create = function(req, res) {
	var user = new User(req.body);

	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;

	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(user);
		}
	});
};

/**
 * Show the current User
 */
exports.read = function(req, res) {
	res.jsonp(req.userInfo);
};

/**
 * Update a User
 */
exports.updateForAdmin = function(req, res) {
	var user = req.userInfo;

	user = _.extend(user , req.body);
	user.displayName = user.firstName + ' ' + user.lastName;

	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(user);
		}
	});
};

/**
 * Delete an User
 */
exports.delete = function(req, res) {
	var user = req.userInfo;

	user.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(user);
		}
	});
};

/**
 * List of Users
 */
exports.list = function(req, res) {
	User.find().exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(users);
		}
	});
};

// NOTE: not exporting this one at this time, since it's only consumed internally by this
// module, when calling the route that includes the username parameter...
// TODO: add username as index to the users collection? It may work faster with the index and if we use findOne.
function userForAdminByUsername (req, res, username)
{
	// TODO: check what's faster / best
	// Pass a callback like here vs. returning a Query object and using exec (see userForAdminByID)
	// Reference here: http://mongoosejs.com/docs/queries.html
	// Also, check if findOne is faster, since username should be unique
	User.find({username: username}, '-salt -password', function(err, user) {
		if (err)
			return res.status(400).send({message: errorHandler.getErrorMessage(err)});
		if (!user)
			return res.status(400).send({message: 'Failed to load User "' + username + '"'});

		if (user.length == 0)
			return res.status(400).send({message: 'User "' + username + '" does not exist'});

		var response = {};
		// Setting response count to 1 since username should be unique
		response.users = user;
		res.jsonp(response);

	});
}

/**
 * User middleware
 */
exports.userForAdminByID = function(req, res, next, id) {
	User.findById(id).exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Error al cargar usuario ' + id));
		req.userInfo = user;
		next();
	});
};


exports.find = function(req, res) {

	var username = req.query.username;

	if (username)
	{
		userForAdminByUsername(req, res, username);
	}
	else
	{
			var query = buildSearchQuery(req.query);
			User.find(query, '-salt -password', function(err, users) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {

							var response = {};
							response.users = users;
							res.jsonp(response);

						}
					});

	}

};

function buildSearchQuery(reqParams)
{
	var query = {};
	if(reqParams.firstname) query.firstName = { $regex: reqParams.firstname, $options: 'i' };
	if(reqParams.lastname) query.lastName = { $regex: reqParams.lastname, $options: 'i' };
	if(reqParams.email) query.email = reqParams.email;
	if(reqParams.city)	query.city = reqParams.city;

	return query;

}
