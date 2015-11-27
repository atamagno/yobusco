'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Service Subcategory Schema
 */
var ServiceSubcategorySchema = new Schema({
    service_category_id: {
        type: Schema.Types.ObjectId,
        trim: true,
        required: 'Please select a service category'
    },
    name: {
        type: String,
        trim: true,
        required: 'Please fill in a name',
    },
    abbr: {
        type: String,
        trim: true,
        required: 'Please fill in an abbreviation',
    },
    keywords: {
        type: [String],
        trim: true,
        required: 'Please fill in at least one keyword',
    }

});

mongoose.model('ServiceSubcategory', ServiceSubcategorySchema);