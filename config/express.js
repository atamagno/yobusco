// modules =================================================
var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    session        = require('express-session'),
    methodOverride = require('method-override'),
    path           = require('path'),
    passport       = require('passport'),
    mongoStore     = require('connect-mongo')({
        session: session
    }),
    consolidate    = require('consolidate'),
    config         = require('./config');

// configuration ===========================================
module.exports = function(db) {

    // globbing model files
    config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
        require(path.resolve(modelPath));
    });

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;
    app.locals.jsFiles = config.getJavaScriptAssets();
    app.locals.cssFiles = config.getCSSAssets();

    app.engine('server.view.html', consolidate[config.templateEngine]);

    // Set views path and view engine
    app.set('view engine', 'server.view.html');
    app.set('views', './app/views');

    // get all data/stuff of the body (POST) parameters
    // parse application/json
    app.use(bodyParser.json());

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

    // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
    app.use(methodOverride());

    // Express MongoDB session storage
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        store: new mongoStore({
            db: db.connection.db,
            collection: config.sessionCollection
        })
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // set the static files location /public/img will be /img for users
    app.use(express.static(path.resolve('./public')));

    // globbing routing files
    config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
        require(path.resolve(routePath))(app);
    });

    return app;
}