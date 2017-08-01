var config = require(__base + 'config/env/development'),
//mailer = require('../app/controllers/mailer.server.controller'),
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
function filterJobsToApprove(job) {
    var jobCreatedDatePlusOneDay = job.created_date;
    jobCreatedDatePlusOneDay.setMinutes(jobCreatedDatePlusOneDay.getMinutes() + 2); // TODO: change this for the line below.
    //jobCreatedDatePlusOneDay.setDate(jobCreatedDatePlusOneDay.getDate() + 1);

    return (jobCreatedDatePlusOneDay < now);
}

var approveJobApp = function() {

    var self = this;

    self.initialize = function() {
        require(__base + 'app/models/job.server.model.js');
    };

    self.start = function() {
        var Job = mongoose.model('Job');

        var pendingStatusID = '56263383477f128bb2a6dd88';
        var activeStatusID = '56269183477f11b662a6dd88';

        // Fetch all jobs with pending status.
        Job.find({ status: pendingStatusID }).exec(function(err, jobs) {
            if (err) {
                console.log('%s: Error retrieving jobs.', Date(Date.now));
                mongoose.connection.close();
            } else {

                if (jobs.length == 0) {
                    console.log('%s: No pending jobs.', Date(Date.now));
                    mongoose.connection.close();
                } else {

                    var jobsToUpdate = jobs.filter(filterJobsToApprove);
                    if (jobsToUpdate.length == 0) {
                        console.log('%s: No pending jobs to approve.', Date(Date.now));
                        mongoose.connection.close();
                    } else {
                        var updatedJobCount = 0;
                        for (var i = 0; i < jobsToUpdate.length; i++) {

                            var jobToUpdate = jobs[i];

                            jobToUpdate.status = activeStatusID;
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

var app = new approveJobApp();
app.initialize();
app.start();