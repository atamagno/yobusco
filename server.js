var init = require('./config/init')(),
    config = require('./config/config'),
    mongoose = require('mongoose');

global.__base = __dirname + '/'

// Bootstrap db connection
var db = mongoose.connect(config.dbConnectionString(), function(err) {
    if (err) {
        console.error('Could not connect to MongoDB!');
        console.log(err);
    }
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// start app ===============================================
app.listen(config.app.port, config.app.server);

// expose app
exports = module.exports = app;

console.log('Application started on port ' + config.app.port);