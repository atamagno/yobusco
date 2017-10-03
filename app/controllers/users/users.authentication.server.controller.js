'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mailer = require('../mailer.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	config = require(__base + 'config/config');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
	'/signin',
	'/signup'
];

/**
 * Signup
 */
exports.signup = function(req, res) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Init Variables
	var user = new User(req.body);
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;

	// Then save the user 
	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {

					// TODO: see what we should do if email wasn't sent. Rollback? Resend option?
					mailer.sendMail(res, 'user-created-email', { name: user.displayName }, 'Creacion de usuario', user.email);

					res.json(user);
				}
			});
		}
	});
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err || !user) {
			res.status(400).send({
				message: 'Nombre de usuario o contraseña incorrectos.'
			});
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});
		}
	})(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
	return function (req, res, next) {
		// Set redirection path on session.
		// Do not redirect to a signin or signup page
		if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
			req.session.redirect_to = req.query.redirect_to;
		}
		// Authenticate
		passport.authenticate(strategy, scope)(req, res, next);
	};
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
	return function (req, res, next) {
		// Pop redirect URL from session
		var sessionRedirectURL = '/#!' + req.session.redirect_to;
		delete req.session.redirect_to;

		passport.authenticate(strategy, function (err, user) {
			if (err) {
				return res.redirect('/#!/signup?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
			}
			if (!user) {
				return res.redirect('/#!/signup');
			}
			req.login(user, function (err) {
				if (err) {
					return res.redirect('/#!/signup');
				}

				return res.redirect(sessionRedirectURL || '/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 * Scenarios:
 * a- If user is not logged in:
 * 	a.1- If user does not exist (with the same provider and provider id OR with the email address within its main email or other provider),
 * 	     --> We will create a new user with data from the provider profile.
 * 	a.2- If user exists
 * 	     --> We check if the provider is not within the list of oauth providers, and we add it if that's the case.
 *
 * b- If user is logged in:
 *  - What should we do? check existing logic.
 *    Not sure when we'll get to this piece of code since when user is signed in, we're hiding the sign in/up
 *	  options and user is redirected to the home page, from the client.
 *	  Test submitting an oauth callback from a different place?
 *	  Test with a different browser window?
 */
exports.saveOAuthUserProfile = function (req, oauthUserProfile, done) {
	if (!req.user) {

		var userSearchQuery = {};
        var oauthUserByIdFieldQueryCriteria = {
            ['oauthProvidersData.provider']: oauthUserProfile.provider,
            ['oauthProvidersData.id']: oauthUserProfile.id
        };

		userSearchQuery = {
			$or: [oauthUserByIdFieldQueryCriteria]
		};

		if(oauthUserProfile.email){
            var oauthUserByMainEmailQueryCriteria = {email: oauthUserProfile.email};
            var oauthUserByOauthEmailQueryCriteria = {['oauthProvidersData.email']: oauthUserProfile.email};
			userSearchQuery.$or.push(oauthUserByMainEmailQueryCriteria, oauthUserByOauthEmailQueryCriteria);
		}

		User.findOne(userSearchQuery, function (err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {
					var possibleUsername = oauthUserProfile.username || generateUsernameForOauthProfile(oauthUserProfile);
					User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
						user = new User({
							firstName: oauthUserProfile.firstName,
							lastName: oauthUserProfile.lastName,
							username: availableUsername,
                            city: oauthUserProfile.city ? config.staticdata.cities.resolveCity(oauthUserProfile.city,oauthUserProfile.country)
								  : undefined,
							displayName: oauthUserProfile.displayName,
							email: oauthUserProfile.email,
							profile_picture: oauthUserProfile.profileImageURL,
							provider: oauthUserProfile.provider,
							oauthProvidersData: [{
								id: oauthUserProfile.id,
								email: oauthUserProfile.email,
								provider: oauthUserProfile.provider,
							}],
							isEmailValidated: true
						});



						// And save the user
						user.save(function (err) {
							return done(err, user);
						});
					});
				} else {

					// If query above did not match by provider (matched by email)
					// We'll add the provider data to the user.
					var userExistsWithSameOauthProfile = _.find(user.oauthProvidersData,{'provider': oauthUserProfile.provider, 'id': oauthUserProfile.id});
					if(!userExistsWithSameOauthProfile){

						// TODO: If email from oauth profile matched an email used during a previous local registration and it has not been validated.
						/*if(user.provider == 'local' && user.email == oauthUserProfile.email && !user.isEmailValidated){
							return done(new Error('Ya existe otro usuario con tu direccion de email, y el mismo no ha sido validado el mismo.'), null);
							// Do you want the email to be resent?
						}*/

                        // TODO: What if the email that matched is from an oauth provider...(rather than local)
                        // Should we always send the email verification email? Or always rely on the oauth provider?
                        // If we do, the same may apply to the scenario above where no user is found...

                        // What about registered with oauth provider, and then creating a local one?
						// Seems like we don't allow creating a profile with the same email address.
						// (given the email is assigned to the main email field) - should we change that?
						// Also, check related note about validations needed on sign up, from ADDITIONAL LOGIC-VALIDATIONS tab on One Note doc.

						user.oauthProvidersData.push({
                            id: oauthUserProfile.id,
                            email: oauthUserProfile.email,
                            provider: oauthUserProfile.provider,
                        });
						user.save(function(err,user){
							return done(err,user);
						});
					}
					else{
						// if the match was because the oauth user profile exists, then return the same user...
                        return done(err, user);
					}

				}
			}
		});
	/*} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) {
				user.additionalProvidersData = {};
			}

			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function (err) {
				return done(err, user, '/settings/accounts');
			});
		} else {
			return done(new Error('User is already connected using this provider'), user);
		}*/
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
	var user = req.user;
	var provider = req.query.provider;

	if (!user) {
		return res.status(401).json({
			message: 'User is not authenticated'
		});
	} else if (!provider) {
		return res.status(400).send();
	}

	// Delete the additional provider
	if (user.additionalProvidersData[provider]) {
		delete user.additionalProvidersData[provider];

		// Then tell mongoose that we've updated the additionalProvidersData field
		user.markModified('additionalProvidersData');
	}

	user.save(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			req.login(user, function (err) {
				if (err) {
					return res.status(400).send(err);
				} else {
					return res.json(user);
				}
			});
		}
	});
};


function generateUsernameForOauthProfile(oauthUserProfile) {
    var username = '';

    if (oauthUserProfile.email) {
        username = oauthUserProfile.email.split('@')[0];
    } else if (oauthUserProfile.firstName && oauthUserProfile.lastName) {
        username = oauthUserProfile.firstName[0] + oauthUserProfile.lastName;
    }

    return username.toLowerCase() || undefined;
};