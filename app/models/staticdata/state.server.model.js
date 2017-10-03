'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    State, States;


/**
 * State Schema
 */
var StateSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Por favor ingrese un nombre.'
    },
    country: {
        type: Schema.ObjectId,
        ref: 'Country'
    }
});

module.exports = function(config){

    State = mongoose.model('State', StateSchema);
    State.find({}).lean().exec(function(err, states) {
        States = states;
        config.staticdata.states = {};
        config.staticdata.states.getAll = getAll;
    });

}

var getAll = function()
{
    return States;
}

// TODO: copy other functions from city (e.g.: getByProperty, etc) once usage of states is needed.
