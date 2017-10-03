'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Country, Countries;


/**
 * Country Schema
 */
var CountrySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Por favor ingrese un nombre.'
    }
});


module.exports = function(config){

    Country = mongoose.model('Country', CountrySchema);
    Country.find({}).lean().exec(function(err, countries) {
        Countries = countries;
        config.staticdata.countries = {};
        config.staticdata.countries.getAll = getAll;
        config.staticdata.countries.getCountryFromString = getCountryFromString;
    });

}


var getCountryFromString = function(string){

    string = string.trim();
    var countrySeparator = string.lastIndexOf(',');

    return countrySeparator !== -1 ? string.substring(countrySeparator +1).trim() : '';

}


var getAll = function()
{
    return Countries;
}


// TODO: copy other functions from city (e.g.: getByProperty, etc) once usage of countries is needed.
