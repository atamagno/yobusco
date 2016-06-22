'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Service Supplier Category Schema
 */
module.exports = function(config){

    var ServiceSupplierCategorySchema = new Schema({
        name: {
            type: String,
            trim: true
        },
        min: {
            type: Number
        },
        max: {
            type: Number
        }
    });

    var ServiceSupplierCategory = mongoose.model('ServiceSupplierCategory', ServiceSupplierCategorySchema);
    ServiceSupplierCategory.find({}).lean().exec(function(err, serviceSupplierCategories) {
        config.staticdata.serviceSupplierCategories = serviceSupplierCategories;
    })

}
