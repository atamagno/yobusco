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
    // TODO: we should create a different user for the supplier rather than setting it to the one creating the supplier.

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
    ServiceSupplier.find().sort('-registration_date')
                          .populate('user', 'displayName')
                          .exec(function(err, servicesuppliers) {
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

    // Looks like we're using the display_name field from the supplier on the client side,
    // so no need to populate the associated user...
    ServiceSupplier.findById(id).populate('services').exec(function(err, servicesupplier){
    // ServiceSupplier.findById(id).populate('user', 'displayName').populate('services').exec(function(err, servicesupplier) {
        if (err) return next(err);
        if (!servicesupplier) return next(new Error('Error al cargar prestador de servicios ' + id));
        req.servicesupplier = servicesupplier ;
        next();
    });
};

exports.listByPage = function(req, res) {

    var currentPage = req.params.currentPage;
    var itemsPerPage = req.params.itemsPerPage;
    var serviceId = req.params.serviceId;

    // TODO: add more validation to query string parameters here.
    if (currentPage && itemsPerPage) {
        currentPage = parseInt(currentPage);
        itemsPerPage = parseInt(itemsPerPage);
        var startIndex = (currentPage - 1) * itemsPerPage;

        var query = buildSearchQuery(req.query, serviceId);
        ServiceSupplier.count(query, function (err, count) {
            if (err) {
                return buildErrorResponse(res, err, 400);
            } else {
                searchServiceSuppliers(query, startIndex, itemsPerPage, count, res);
            }
        });

    } else {
        return buildErrorResponse(res, err, 400, 'Algo sali\u00f3 mal');
    }
};

function buildSearchQuery(queryString, serviceId) {

    var query = serviceId ? { services: serviceId } : {};
    if (queryString.supplierName) {
        query.display_name = { $regex: queryString.supplierName, $options: 'i' };
    }
    if (queryString.jobAmount) {
        query.jobCount = { $gte: queryString.jobAmount };
    }

    return query;
};

function searchServiceSuppliers(query, startIndex, itemsPerPage, count, res) {

    var results = { totalItems: count };
    // TODO: need to define sort strategy
    ServiceSupplier.find(query, {}, { skip: startIndex, limit: itemsPerPage, sort: { points: -1, registration_date: 1 } }, function(err, servicesuppliers) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            results.servicesuppliers = servicesuppliers;
            res.jsonp(results);
        }
    });
};

function buildErrorResponse(res, err, status, errorMessage) {
    var message = errorMessage ? errorMessage : errorHandler.getErrorMessage(err);
    return res.status(status).send({
        message: message
    });
};