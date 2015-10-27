'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Service Supplier Schema
 */
var ServiceSupplierSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        trim: true,
        required: 'Please fill in a user id'
    },
    display_name: {
        type: String,
        trim: true,
        required: 'Please fill in a display name'
    },
    phone_number: {
        type: String,
        trim: true,
        required: 'Please fill in a phone number'
        // match: [/.+\@.+\..+/, 'Please fill a valid email address'] TODO: add regex for phone number here?
    },
    email: {
        type: String,
        trim: true,
        required: 'Please fill in an email address',
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    registration_date: {
        type: Date,
        default: Date.now
    },

    description: {
        type: String,
        default: ''
    },
    services: {
        type: [Schema.Types.ObjectId],
        required: 'At least one service subcategory is required'
    }

});

mongoose.model('ServiceSupplier', ServiceSupplierSchema);