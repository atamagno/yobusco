'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    ServiceSubcategory = mongoose.model('ServiceSubcategory'),
    ServiceCategory = mongoose.model('ServiceCategory'),
    _ = require('lodash');

/**
 * Create a ServiceSubcategory
 */
exports.create = function(req, res) {
    var servicesubcategory = new ServiceSubcategory(req.body);

    // TODO: need to change the way the keywords are populated
    if (servicesubcategory.keywords && servicesubcategory.keywords.length) {
        servicesubcategory.keywords = servicesubcategory.keywords[0].split(",");
    }

    servicesubcategory.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesubcategory);
        }
    });
};

/**
 * Show the current ServiceSubcategory
 */
exports.read = function(req, res) {
    res.jsonp(req.servicesubcategory);
};

/**
 * Update a ServiceSubcategory
 */
exports.update = function(req, res) {
    var servicesubcategory = req.servicesubcategory ;

    servicesubcategory = _.extend(servicesubcategory , req.body);

    // TODO: need to change the way the keywords are populated
    if (servicesubcategory.keywords && servicesubcategory.keywords.length) {
        servicesubcategory.keywords = servicesubcategory.keywords[0].split(",");
    }

    servicesubcategory.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesubcategory);
        }
    });
};

/**
 * Delete an ServiceSubcategory
 */
exports.delete = function(req, res) {
    var servicesubcategory = req.servicesubcategory ;

    servicesubcategory.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesubcategory);
        }
    });
};

/**
 * List of ServiceSubcategories
 */
exports.list = function(req, res) {
    ServiceSubcategory.find().exec(function(err, servicesubcategories) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesubcategories);
        }
    });
};

/**
 * ServiceSubcategory middleware
 */
exports.servicesubcategoryByID = function(req, res, next, id) {
    ServiceSubcategory.findById(id).exec(function(err, servicesubcategory) {
        if (err) return next(err);
        if (! servicesubcategory) return next(new Error('Error al cargar subcategor\u00eda de servicio ' + id));
        req.servicesubcategory = servicesubcategory ;
        next();
    });
};

// TODO: get data from db on app initialization - and cache the results. Use app.locals / redis for cache?, and return
// cached results from these route handlers?

exports.serviceSubcategoriesKeywords = function(req, res)
{
    ServiceSubcategory.find().exec(function(err, serviceSubcategories)
    {
        if(err)  // TODO: how should we handle errors? Just send them back to the client along with a status code?
            res.status(500).send(err);

        var serviceSubcategoriesKeywords = [];
        serviceSubcategories.forEach(function(serviceSubcategory)
        {
            serviceSubcategoriesKeywords = serviceSubcategoriesKeywords.concat(
                serviceSubcategory.keywords.map(function(keyword)
                {
                    return {keyword:keyword, serviceSubcategoryId:serviceSubcategory.id.toString()}
                }));
        });

        var sortedKeywords = serviceSubcategoriesKeywords.sort(function(a, b) {
            if (a.keyword > b.keyword) {
                return 1;
            }
            if (a.keyword < b.keyword) {
                return -1;
            }
            return 0;
        });

        res.json(sortedKeywords);
    });
};

exports.search = function(req, res) {
    res.json(req.servicesubcategories);
};

exports.serviceSubcategoriesByServiceCategory = function(req, res, next, serviceCategoryId) {

    // TODO: need to define sort strategy
    ServiceSubcategory.find({service_category_id: serviceCategoryId}, function(err, servicesubcategories)
    {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicesubcategories);
        }
    });
};

exports.listByPage = function(req, res) {

    var currentPage = req.params.currentPage;
    var itemsPerPage = req.params.itemsPerPage;

    // TODO: add more validation to query string parameters here.
    if (currentPage && itemsPerPage) {
        currentPage = parseInt(currentPage);
        itemsPerPage = parseInt(itemsPerPage);
        var startIndex = (currentPage - 1) * itemsPerPage;

        var response = {};
        ServiceSubcategory.count({}, function (err, count) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

                response.totalItems = count;
                ServiceSubcategory.find({}, {}, { skip: startIndex, limit: itemsPerPage }, function(err, servicesubcategories) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        response.servicesubcategories = servicesubcategories;
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