'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    config = require('../../config/config');

/**
 * Service Supplier Schema
 */
var ServiceSupplierSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    display_name: {
        type: String,
        trim: true,
        required: 'Por favor ingrese un nombre'
    },
    phone_number: {
        type: String,
        trim: true,
        required: 'Por favor ingrese un tel\u00e9fono'
        // match: [/.+\@.+\..+/, 'Please fill a valid email address'] TODO: add regex for phone number here?
    },
    email: {
        type: String,
        trim: true,
        required: 'Por favor ingrese una direcci\u00f3n de email',
        match: [/.+\@.+\..+/, 'Por favor ingrese una direcci\u00f3n de email v\u00e1lida']
    },
    registration_date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: ''
    },
    services:{
        type: [{
            type: Schema.ObjectId,
            ref: 'ServiceSubcategory'
        }],
        required: 'Al menos una subcategor\u00eda de servicio es requerida'
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    jobCount: {
        type: Number,
        default: 0
    },
    overall_rating: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: null
    },
    category:{
        type: Schema.ObjectId,
        ref: 'ServiceSupplierCategory',
        default: null
    }
});

ServiceSupplierSchema.statics.getServiceSupplierCategory = function(pointsValue)
{
    return _.find(config.staticdata.serviceSupplierCategories,function(category){
        if(pointsValue>=0.0){
            return category.min <= pointsValue && pointsValue  <= category.max
        }
        else{
            return pointsValue <= category.min && pointsValue >= category.max
        }
    });
}

mongoose.model('ServiceSupplier', ServiceSupplierSchema);