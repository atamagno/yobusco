'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    ServiceSupplier = mongoose.model('ServiceSupplier');

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
