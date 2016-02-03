'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Review Ratings Avg Points Schema
 */
module.exports = function(config){

    var ReviewRatingsAvgPointsRangeSchema = new Schema({
        min: {
            type: Number
        },
        max: {
            type: Number
        },
        points: {
            type: Number
        }
    });

    var ReviewRatingsAvgPointsRange = mongoose.model('ReviewRatingsAvgPointsRange', ReviewRatingsAvgPointsRangeSchema);
    ReviewRatingsAvgPointsRange.find({}).lean().exec(function(err, reviewRatingsAvgPointsRanges) {
        config.staticdata.reviewRatingsAvgPointsRanges = reviewRatingsAvgPointsRanges;
    })

}
