'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    users = require(__base + 'app/controllers/users.server.controller');


module.exports = function (config) {
  // Use google strategy
    passport.use(new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        passReqToCallback: true
    },
        function (req, accessToken, refreshToken, profile, done) {
            // Set the provider data and include tokens
            var providerData = profile._json;
            var cityName = providerData.placesLived ? config.staticdata.cities.getCityFromString(providerData.placesLived[0].value) : undefined;
            var countryName = providerData.placesLived ?  config.staticdata.countries.getCountryFromString(providerData.placesLived[0].value) : undefined;

            // Create the user OAuth profile
            var oauthUserProfile = {
              id: providerData.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              displayName: profile.displayName,
              city: cityName,
              country: countryName,
              email: profile.emails ? profile.emails[0].value : undefined,
              profileImageURL: profile.photos[0].value,
              provider: 'google'
            };

            // Save the user OAuth profile
            users.saveOAuthUserProfile(req, oauthUserProfile, done);
  }));
};
