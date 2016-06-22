var config = require('./../config/env/development'),
//mailer = require('./../app/controllers/mailer.server.controller'),
    mongoose = require('mongoose');

var db = mongoose.connect(config.dbConnectionString(), function(err) {
    if (err) {
        console.log('Could not connect to MongoDB!');
        console.log(err);
    } else {
        console.log('Successfully connected to MongoDB!');
    }
});

var now = new Date();
function filterDelayedJobs(job) {
    return (job.expected_date > now);
}

var delayJobApp = function() {

    var self = this;

    self.initialize = function() {
        require('./../app/models/job.server.model.js');
    };

    self.start = function() {
        var Job = mongoose.model('Job');

        var activeStatusID = '56269183477f11b662a6dd88';
        var delayedStatusID = '56269183477f11b0b2a99d88';

        // Fetch all jobs with active status.
        Job.find({ status: activeStatusID }).exec(function(err, jobs) {
            if (err) {
                console.log('%s: Error retrieving jobs.', Date(Date.now));
                mongoose.connection.close();
            } else {

                if (jobs.length == 0) {
                    console.log('%s: No active jobs.', Date(Date.now));
                    mongoose.connection.close();
                } else {

                    var jobsToUpdate = jobs.filter(filterDelayedJobs);
                    if (jobsToUpdate.length == 0) {
                        console.log('%s: No active jobs to update.', Date(Date.now));
                        mongoose.connection.close();
                    } else {
                        var updatedJobCount = 0;
                        for (var i = 0; i < jobsToUpdate.length; i++) {

                            var jobToUpdate = jobs[i];

                            jobToUpdate.status = delayedStatusID;
                            jobToUpdate.save(function(err, job) {
                                if (err) {
                                    console.log('%s: Error updating job %s', Date(Date.now), job._id);
                                    mongoose.connection.close();
                                } else {
                                    // TODO; send email here.
                                    console.log('Succesfully updated job %s', job._id);

                                    updatedJobCount++;
                                    if (updatedJobCount == jobsToUpdate.length) {
                                        mongoose.connection.close();
                                    }
                                }
                            });
                        }
                    }
                }
            }
        });
    }
}

var app = new delayJobApp();
app.initialize();
app.start();