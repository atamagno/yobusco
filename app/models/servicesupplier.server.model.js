'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    config = require(__base + 'config/config');

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
}, {_id: false});

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
    job_counts: {
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
    category: {
        type: Schema.ObjectId,
        ref: 'ServiceSupplierCategory',
        default: null
    },
    city: {
        type: Schema.ObjectId,
        ref: 'City',
        required: 'Por favor seleccione una ubicaci\u00f3n'
    }
});

ServiceSupplierSchema.methods.updatePoints = function(points)
{
    if(points){
        this.points += points;
        this.points = parseFloat(this.points.toFixed(2)); // rounding...
        this.updateCategory();
    }

};


ServiceSupplierSchema.set('toJSON', {virtuals: true});

// need to add virtuals toJSON == true here? Just like in jobs?
// E.g: ServiceSupplierSchema.set('toJSON', {virtuals: true});?
// Need to use toJSON when returning supplier just like in jobs here to reflect virtual?
ServiceSupplierSchema.virtual('effectiveness').get(function(){

    return this.getEffectiveness();

});

ServiceSupplierSchema.methods.updateCategory = function(){

    this.category = this.constructor.getCategory(this.points)._id;

};

ServiceSupplierSchema.methods.updateJobCounts = function(previousJobStatusId, jobStatusId)
{

    // If we received a previous status, and it's different than the next status,
    // we'll look for it and decrement it.
    if(previousJobStatusId){
        if(!previousJobStatusId.equals(jobStatusId)){
            var previousJobStatusJobCountIndex = _.findIndex(this.job_counts, {jobstatus:previousJobStatusId});
            if(previousJobStatusJobCountIndex != -1){
                this.job_counts[previousJobStatusJobCountIndex].count--;
            }

        }
        else {return;} // if previous and new status are the same, then there's nothing to update.
    }

    // If we received a next status, we'll add it if it does not exist in the collection
    // or increment the count for it, if we have it already.
    if(jobStatusId){
        var jobStatusJobCountIndex = _.findIndex(this.job_counts, {jobstatus: jobStatusId});
            if (jobStatusJobCountIndex == -1) {
                this.job_counts.push({jobstatus: jobStatusId, count: 1})
            }
            else {
                this.job_counts[jobStatusJobCountIndex].count++;
            }
    }
};


ServiceSupplierSchema.statics.getCategory = function(points)
{
    return _.find(config.staticdata.serviceSupplierCategories,function(category){
        if(points>=0.0){
            return category.min <= points && points  <= category.max
        }
        else{
            return points <= category.min && points >= category.max
        }
    });
};


ServiceSupplierSchema.methods.getEffectiveness = function()
{

    var serviceSupplier = this;
    var totalJobs = _.sumBy(serviceSupplier.job_counts, 'count') ; // TODO: test with new supplier (job counts array length == 0 / [])
    // use sumBy?? https://stackoverflow.com/questions/38448740/sum-up-object-properties-in-array-of-objects-into-a-single-object-lodash
    // maybe check !serviceSupplier.job_counts || !serviceSupplier.job_counts.length first?
    // before calculating totalJobs using sumBy as above?

    // TODO: check supplier without jobs, for short circuit. Verify from client to not display effectiveness when null / []?
    if(!totalJobs){
        return null;
        // return []?;
    }
    else{
        //var supplierJobsFinished = _.filter(serviceSupplier.job_counts, function(jobs){
        //    return jobs.jobstatus._id == config.staticdata.jobStatuses.enums.GUARANTEED ||
        //                             config.staticdata.jobStatuses.enums.FINISHED;
        // });
        // TODO: try querying for pintores from home page...breaking...maybe due to not finished/guaranteed jobs..???
        // need extra condition here???
        var supplierJobsFinished = _.find(serviceSupplier.job_counts,
                                          ['jobstatus', config.staticdata.jobStatuses.enums.FINISHED]) || {count: 0};
        var supplierJobsGuaranteed = _.find(serviceSupplier.job_counts,
                                          ['jobstatus', config.staticdata.jobStatuses.enums.GUARANTEED]) || {count: 0};

        // TODO: look for cleaner way to check for empty results (other than using || {} )
        // TODO: if no finished, guaranteed, .count below is messing up the math...
        // Maybe use a count function from lodash directly?
        // maybe cast to number/int/float? Check for null values...
        return (supplierJobsFinished.count + supplierJobsGuaranteed.count) / totalJobs;
        // .count as null for cetain suppliers is making this to break...
        // need to add extra condition here...
        // need to factor in nothired jobs here???
        // Maybe not - probably nothired is part of total...
    }

};


mongoose.model('ServiceSupplier', ServiceSupplierSchema);