'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    ServiceSupplier = mongoose.model('ServiceSupplier'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * Create a ServiceSupplier
 */
exports.create = function(req, res) {
    var servicesupplier = new ServiceSupplier(req.body);
    var user = new User(req.body);

    user.provider = 'local';
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function(errCreatingUser) {
        if (errCreatingUser) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(errCreatingUser)
            });
        } else {
            servicesupplier.user = user;
            servicesupplier.save(function(errCreatingServiceSupplier) {
                if (errCreatingServiceSupplier) {
                    // Rollback if error creating service supplier, delete user.
                    user.remove(function(errDeletingUser) {
                        if (errDeletingUser) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(errDeletingUser)
                            });
                        } else {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(errCreatingServiceSupplier)
                            });
                        }
                    });
                } else {
                    res.jsonp(servicesupplier);
                }
            });
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
exports.serviceSupplierByID = function(req, res, next, id) {
    // Looks like we're using the display_name field from the supplier on the client side,
    // so no need to populate the associated user...
    ServiceSupplier.findById(id).populate('services').populate('city').exec(function(err, servicesupplier){
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
    var cityId = req.params.cityId;

    // TODO: add more validation to query string parameters here.
    if (currentPage && itemsPerPage) {
        currentPage = parseInt(currentPage);
        itemsPerPage = parseInt(itemsPerPage);
        var startIndex = (currentPage - 1) * itemsPerPage;

        var orderCondition = buildOrderCondition(req.query.orderBy);
        var query = buildSearchQuery(req.query, serviceId, cityId);
        ServiceSupplier.count(query, function (err, count) {
            if (err) {
                return buildErrorResponse(res, err, 400);
            } else {
                searchServiceSuppliers(query, orderCondition, startIndex, itemsPerPage, count, res);
            }
        });

    } else {
        return buildErrorResponse(res, err, 400, 'Algo sali\u00f3 mal');
    }
};

function buildSearchQuery(queryString, serviceId, cityId) {

    var query = serviceId ? { services: serviceId, city: cityId } : {};
    if (queryString.supplierName) {
        query.display_name = { $regex: queryString.supplierName, $options: 'i' };
    }

    /*
    if (queryString.jobAmount) {
        query.jobCount = { $gte: queryString.jobAmount };
    }
    */

    return query;
};

function buildOrderCondition(orderBy) {

    var orderCondition = { points: -1 };
    switch (orderBy)
    {
        case 'jobCount':
            orderCondition = { jobCount: 1 };
            break;
        case 'memberSince':
            orderCondition = { registration_date: 1 };
            break;
        case 'name':
            orderCondition = { display_name: 1 };
            break;
    }

    return orderCondition;
};

function searchServiceSuppliers(query, orderCondition, startIndex, itemsPerPage, count, res) {

    var results = { totalItems: count };
    // TODO: need to define sort strategy
    ServiceSupplier.find(query, {},
        {
            skip: startIndex,
            limit: itemsPerPage,
            sort: orderCondition
        }, function(err, servicesuppliers) {

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

exports.serviceSupplierByUserID = function(req, res) {

    var userId = req.params.userId;

    ServiceSupplier.findOne({ user: userId }).exec(function(err, servicesupplier) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesupplier);
        }
    });
};

function buildErrorResponse(res, err, status, errorMessage) {
    var message = errorMessage ? errorMessage : errorHandler.getErrorMessage(err);
    return res.status(status).send({
        message: message
    });
};