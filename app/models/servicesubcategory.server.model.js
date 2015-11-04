'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Service Supplier Schema
 */
var ServiceSubcategorySchema = new Schema({
    service_category_id: {
        type: Schema.Types.ObjectId,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    abbr: {
        type: String,
        trim: true,
        required: true
    },
    keywords: {
        type: [String],
        trim: true,
        required: true
    }

});

mongoose.model('ServiceSubcategory', ServiceSubcategorySchema);