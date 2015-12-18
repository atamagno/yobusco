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
        required: 'Por favor seleccione una categor\u00eda de servicio'
    },
    name: {
        type: String,
        trim: true,
        required: 'Por favor ingrese un nombre',
    },
    abbr: {
        type: String,
        trim: true,
        required: 'Por favor ingrese una abreviaci\u00f3n',
    },
    keywords: {
        type: [String],
        trim: true,
        required: 'Por favor ingrese al menos una palabra clave',
    }

});

mongoose.model('ServiceSubcategory', ServiceSubcategorySchema);