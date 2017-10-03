'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    City,Cities;

/**
 * City Schema
 */
var CitySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Por favor ingrese un nombre.'
    },
    state: {
        type: Schema.ObjectId,
        ref: 'State'
    }
});


module.exports = function(config){

    City = mongoose.model('City', CitySchema);
    config.staticdata.cities = {};
    config.staticdata.cities.getAll = getAll;
    config.staticdata.cities.getByProperty = getByProperty;
    config.staticdata.cities.getMultipleByProperty = getMultipleByProperty;
    config.staticdata.cities.resolveCity = resolveCity;
    config.staticdata.cities.getCityFromString = getCityFromString;
    getAllFromDb();

};

var getByProperty = function(propertyName, propertyValue)
{
    return _.find(Cities,_.matchesProperty(propertyName,propertyValue));
}

var getMultipleByProperty = function(propertyName, propertyValue)
{
    return _.filter(Cities,[propertyName, propertyValue]);
}

var getAll = function()
{
    return Cities;
}


var getCityFromString = function(string){

    string = string.trim();
    var citySeparator = string.indexOf(',');

    return citySeparator !== -1 ? string.substring(0, citySeparator).trim() : string;

};



var resolveCity = function(cityName, countryName){


    var cityNameRegex = new RegExp('\\b' + cityName + '\\b', 'i');
    var countryNameRegex = new RegExp('^$|\\b' + countryName + '\\b', 'i'); // country may be empty, so we match empty too - if it's the case.


    return _.find(Cities, function(city){
        return cityNameRegex.test(city.name) && countryNameRegex.test(city.state.country.name);
    });

}

function getAllFromDb(){

    City.find({})
        .populate({path: 'state',
                   populate: {path: 'country', model: 'Country', options: {lean:true}}})
        .lean()
        .exec(function(err, cities) {
               Cities = cities;
        });
}


// Synchronizing local data after new/updated/removed items
CitySchema.post('remove', function(){

    getAllFromDb();

});

CitySchema.post('save', function(){

    getAllFromDb();

});