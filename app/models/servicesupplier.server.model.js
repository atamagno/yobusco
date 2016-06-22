'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    config = require('../../config/config');

var JobCount = new Schema({
    jobstatus: {
        type: Schema.ObjectId,
        ref: 'JobStatus',
        required: true
    },
    count: {
        type: Number,
        default: 0
    }
});

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
    jobCounts: {
        type: [JobCount],
        default: []
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

ServiceSupplierSchema.methods.updatePoints = function(points) {
    this.points += points;
    this.points = parseFloat(this.points.toFixed(2)); // rounding...
    this.updateCategory();
}

ServiceSupplierSchema.methods.updateCategory = function() {

    this.category = this.constructor.getCategory(this.points)._id;

}

ServiceSupplierSchema.methods.updateJobCounts = function(previousJobStatusId, jobStatusId)
{
    // TODO: this needs to consider decrementing the previous job status count,
    // and incrementing the new one...probably to be called from pre save, with the previous status id...
    // Probably there should be a difference between new and updated jobs.
    if (previousJobStatusId) {
        var previousJobStatusJobCountIndex = _.findIndex(this.jobCounts, { jobstatus:previousJobStatusId });
        if (previousJobStatusJobCountIndex >= 0) {
            this.jobCounts[previousJobStatusJobCountIndex].count--;
        }
    }

    var jobStatusJobCountIndex = _.findIndex(this.jobCounts, { jobstatus:jobStatusId });
    if (jobStatusJobCountIndex == -1) {
        this.jobCounts.push({ jobstatus: jobStatusId, count: 1 })
    }
    else {
        this.jobCounts[jobStatusJobCountIndex].count++;
    }
}

ServiceSupplierSchema.statics.getCategory = function(points) {
    return _.find(config.staticdata.serviceSupplierCategories, function(category) {
        if (points >= 0.0){
            return ((category.min <= points) && (points <= category.max))
        }
        else {
            return ((points <= category.min) && (points >= category.max))
        }
    });
}

mongoose.model('ServiceSupplier', ServiceSupplierSchema);