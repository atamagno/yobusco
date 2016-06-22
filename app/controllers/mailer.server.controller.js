'use strict';

/**
 * Module dependencies.
 */
var config = require('../../config/env/development'),
    nodemailer = require('nodemailer');

exports.sendMail = function(response, templateName, templateInfo, subject, toEmail) {

    templateInfo.appName = config.app.title;

    // TODO: add error handling
    response.render('templates/' + templateName, templateInfo, function(err, emailHTML) {

        var smtpTransport = nodemailer.createTransport(config.mailer.options);
        var mailOptions = {
            to: toEmail,
            from: config.mailer.from,
            subject: subject,
            html: emailHTML
        };

        smtpTransport.sendMail(mailOptions);
    });
}