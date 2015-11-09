'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    ServiceSupplier = mongoose.model('ServiceSupplier'),
    _ = require('lodash');

/**
 * Create a ServiceSupplier
 */
exports.create = function(req, res) {
    var servicesupplier = new ServiceSupplier(req.body);
    servicesupplier.user = req.user;

    servicesupplier.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesupplier);
        }
    });
};

/**
 * Show the current ServiceSupplier
 */
exports.read = function(req, res) {
    res.jsonp(req.servicesupplier);
};

/**
 * Update a ServiceSupplier
 */
exports.update = function(req, res) {
    var servicesupplier = req.servicesupplier ;

    servicesupplier = _.extend(servicesupplier , req.body);

    servicesupplier.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesupplier);
        }
    });
};

/**
 * Delete an ServiceSupplier
 */
exports.delete = function(req, res) {
    var servicesupplier = req.servicesupplier ;

    servicesupplier.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesupplier);
        }
    });
};

/**
 * List of ServiceSupplier
 */
exports.list = function(req, res) {
    ServiceSupplier.find().sort('-registration_date').populate('user', 'displayName').exec(function(err, servicesuppliers) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesuppliers);
        }
    });
};

/**
 * ServiceSupplier middleware
 */
exports.servicesupplierByID = function(req, res, next, id) {
    ServiceSupplier.findById(id).populate('user', 'displayName').exec(function(err, servicesupplier) {
        if (err) return next(err);
        if (! servicesupplier) return next(new Error('Failed to load Servicesupplier ' + id));
        req.servicesupplier = servicesupplier ;
        next();
    });
};

/**
 * Using single controller file for now.
 * Once we add more features for servicesuppliers, we can split in
 * different files just like done in users.server.controller.js
 */
exports.serviceSuppliersBySubcategory = function(req, res)
{
    ServiceSupplier.find({services: req.params.servicesubcategory}, function(err, serviceSuppliers)
    {
        if(err)  // TODO: how should we handle errors? Just send them back to the client along with a status code?
            res.status(500).send(err);

        res.json(serviceSuppliers);
    });
};
