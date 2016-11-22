'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Service Subcategory Schema
 */
var CitySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Por favor ingrese un nombre',
    }
});

mongoose.model('City', CitySchema);