'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    users = require(__base + 'app/controllers/users.server.controller');

module.exports = function (config) {
    // Use facebook strategy
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL,
            profileFields: ['id', 'name', 'displayName', 'emails', 'location{location}'],
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
            // Set the provider data and include tokens
            var providerData = profile._json;

            // Create the user OAuth profile
            var oauthUserProfile = {
                id: providerData.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                displayName: profile.displayName,
                city: (providerData.location) ? providerData.location.location.city : '',
                country: (providerData.location) ? providerData.location.location.country : '',
                email: profile.emails ? profile.emails[0].value : undefined,
                profileImageURL: (profile.id) ? '//graph.facebook.com/' + profile.id + '/picture?type=large' : undefined,
                provider: 'facebook'
            };

            // Save the user OAuth profile
            users.saveOAuthUserProfile(req, oauthUserProfile, done);
    }));
};
