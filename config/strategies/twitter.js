'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  TwitterStrategy = require('passport-twitter').Strategy,
  users = require(__base  + 'app/controllers/users.server.controller');


module.exports = function (config) {
          // Use twitter strategy
          passport.use(new TwitterStrategy({
                consumerKey: config.twitter.clientID,
                consumerSecret: config.twitter.clientSecret,
                callbackURL: config.twitter.callbackURL,
                userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
                passReqToCallback: true
          },
          function (req, token, tokenSecret, profile, done) {
                // Set the provider data and include tokens
                var providerData = profile._json;

                // Create the user OAuth profile
                var displayName = profile.displayName.trim();
                var iSpace = displayName.lastIndexOf(' '); // last index of the whitespace (e.g.: there could be a middle name)
                var firstName = iSpace !== -1 ? displayName.substring(0, iSpace) : displayName;
                var lastName = iSpace !== -1 ? displayName.substring(iSpace + 1) : '';

                var cityName = config.staticdata.cities.getCityFromString(providerData.location);
                var countryName = config.staticdata.countries.getCountryFromString(providerData.location);

                var oauthUserProfile = {
                  id: providerData.id_str,
                  firstName: firstName,
                  lastName: lastName,
                  displayName: displayName,
                  city: cityName,
                  country: countryName,
                  username: profile.username,
                  email: profile.emails ? profile.emails[0].value : undefined,
                  profileImageURL: profile.photos[0].value.replace('normal', 'bigger'),
                  provider: 'twitter'
                };

                // Save the user OAuth profile
                users.saveOAuthUserProfile(req, oauthUserProfile, done);
          }));
};
