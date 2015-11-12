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

exports.serviceSuppliersBySubcategory = function(req, res) {

    var currentPage = req.params.currentPage;
    var itemsPerPage = req.params.itemsPerPage;
    var serviceId = req.params.serviceId;

    // TODO: add more validation to query string parameters here.
    if (currentPage && itemsPerPage) {
        currentPage = parseInt(currentPage);
        itemsPerPage = parseInt(itemsPerPage);
        var startIndex = (currentPage - 1) * itemsPerPage;

        var response = {};
        ServiceSupplier.count({ services: serviceId }, function (err, count) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

                response.totalItems = count;
                // TODO: need to define sort strategy
                ServiceSupplier.find({ services: serviceId }, {}, { skip: startIndex, limit: itemsPerPage }, function(err, servicesuppliers) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        response.servicesuppliers = servicesuppliers;
                        res.jsonp(response);
                    }
                });
            }
        });

    } else {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    }
};
