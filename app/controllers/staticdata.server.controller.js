'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    ServiceSubcategory = mongoose.model('ServiceSubcategory');

// TODO: get data from db on app initialization - and cache the results. Use app.locals / redis for cache?, and return
// cached results from these route handlers?

exports.serviceSubcategories = function(req, res)
{
    ServiceSubcategory.find({},'-keywords', function(err, serviceSubcategories)
    {
        if(err)  // TODO: how should we handle errors? Just send them back to the client along with a status code?
            res.status(500).send(err);

        res.json(serviceSubcategories);
    });

};



exports.serviceSubcategoriesKeywords = function(req, res)
{
    ServiceSubcategory.find({}, function(err, serviceSubcategories)
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

        res.json(serviceSubcategoriesKeywords);
    });

};


