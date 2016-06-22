'use strict';

module.exports = {

    app: {
        title: 'Yo Busco - Test Environment',
        port: process.env.OPENSHIFT_NODEJS_PORT || 8002,
        server: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
    },

    db: {
        port: process.env.OPENSHIFT_MONGODB_DB_PORT || '27017',
        server: process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1',
        user: process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'admin',
        password: process.env.OPENSHIFT_MONGODB_DB_PASSWORD || 'BEKI3Yk9we9V',
        database: 'manodeobratest',
    },

      dbConnectionString : function()
      {
          return 'mongodb://' + this.db.user + ':' + this.db.password + '@' + this.db.server + ':' + this.db.port + '/'  + this.db.database
      },

      mailer: {
          from: process.env.MAILER_FROM || 'sandbox5828bd2f4b634ad39b54049443bbdc6f.mailgun.org',
          options: {
              service: process.env.MAILER_SERVICE_PROVIDER || 'Mailgun',
              auth: {
                  user: process.env.MAILER_EMAIL_ID || 'postmaster@sandbox5828bd2f4b634ad39b54049443bbdc6f.mailgun.org',
                  pass: process.env.MAILER_PASSWORD || '0869030670e24a94af7c440353c926f9'
              }
          }
      },

      facebook: {
          clientID: process.env.FACEBOOK_ID || '1781364922094879',
          clientSecret: process.env.FACEBOOK_SECRET || '28c62eb3b4a79bdb2303b53b60f350fc',
          callbackURL: '/api/auth/facebook/callback'
      },
      twitter: {
          clientID: process.env.TWITTER_KEY || 'qF7JP3aH5HqWQbt5NvQ2Geb5L',
          clientSecret: process.env.TWITTER_SECRET || '1liN8RgHvuIhauSrX148DOsURlcaNAcWlQUXlpjxEE6bjDXtsx',
          callbackURL: '/api/auth/twitter/callback'
      },
      google: {
          clientID: process.env.GOOGLE_ID || '459029814281-626delfb2s2pkh7ocrkur059h9538uoh.apps.googleusercontent.com',
          clientSecret: process.env.GOOGLE_SECRET || 'Q1i0wqtZAQajhP641DNXbvvD',
          callbackURL: '/api/auth/google/callback'
      }
};
