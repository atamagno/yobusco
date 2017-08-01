'use strict';

/**
 * Module dependencies.
 */
var config = require(__base + 'config/config'),
    nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

// TODO: add error handling and accept a callback...
exports.sendMail = function(response, templateName, templateInfo, subject, toEmail, bcc) {

    templateInfo.appName = config.app.title;

    // TODO: add error handling
    // TODO: seems that response.render is taking a considerable amount of time.
    // Compare with 'Using swig-email-templates' section from https://github.com/nodemailer/nodemailer
    response.render('templates/' + templateName, templateInfo, function(err, emailHTML) {

        var mailOptions = {
            from: config.mailer.from,
            subject: config.app.title + ' - ' + subject,
            html: emailHTML
        };

        if(bcc) {
            mailOptions.bcc = bcc;
            mailOptions.to = config.mailer.from;
        }
        else{
            mailOptions.to = toEmail;
        }

        // TODO: add error handling
        smtpTransport.sendMail(mailOptions);
    });
}