'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	_ = require('lodash'),
	RatingType,
	RatingTypes;

/**
 * RatingType Schema
 */
var RatingTypeSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Por favor ingrese un nombre',
		trim: true
	},
	jobstatuses: [{
		type: Schema.ObjectId,
		ref: 'JobStatus'
	}],
	description: {
		type: String,
		default: '',
		required: 'Por favor ingrese una descripci\u00f3n',
		trim: true
	}
});

module.exports = function(config){

	RatingType = mongoose.model('RatingType', RatingTypeSchema);
	RatingType.find({}).lean().exec(function(err, ratingTypes) {
		RatingTypes = ratingTypes;
		config.staticdata.ratingTypes = {};
		config.staticdata.ratingTypes.getAll = getAll;
		config.staticdata.ratingTypes.getByProperty = getByProperty;
		config.staticdata.ratingTypes.getMultipleByProperty = getMultipleByProperty;
	});

};

var getAll = function()
{
	return RatingTypes;
};

var getByProperty = function(propertyName, propertyValue)
{
	return _.find(RatingTypes,_.matchesProperty(propertyName,propertyValue));
};

var getMultipleByProperty = function(propertyName, propertyValue)
{
	return _.filter(RatingTypes,[propertyName, propertyValue]);
};



// Synchronizing local data after removed items
RatingTypeSchema.post('remove', function(){

	RatingType.find({}).lean().exec(function(err, ratingTypes){
		RatingTypes = ratingTypes;
	});

});

// Synchronizing local data after saved (updated/new) items
RatingTypeSchema.post('save', function(){

	RatingType.find({}).lean().exec(function(err, ratingTypes){
		RatingTypes = ratingTypes;
	});

});



