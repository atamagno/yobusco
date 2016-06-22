
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * User Supplier Action Points Schema
 */
module.exports = function(config){

    var UserSupplierActionPointsSchema = new Schema({
        action_name: {
            type: String,
            trim: true
        },
        points: {
            Type: {}
        }
    });

    var UserSupplierActionPoints = mongoose.model('UserSupplierActionPoints', UserSupplierActionPointsSchema);
    UserSupplierActionPoints.find({}).lean().exec(function(err, userSupplierActionPoints) {
        config.staticdata.userSupplierActionPoints = userSupplierActionPoints;
    })

}
