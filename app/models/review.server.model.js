'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Rating = require('./rating.server.model'),
	_ = require('lodash'),
	config = require(__base + 'config/config'),
	ReviewModelValidator = require('./helpers/validators/review.server.model.validator');

/**
 * Review Schema
 */
// NOTE: validators of ratings are being executed, even if it's an array - when declared inline
// What's the difference with job.services that requires a separate declaration of validator...?
// (at least the way they're declared --> services = object id ref vs. ratings = embedded subdoc.
// TODO: Approving from supplier an in progress job to incomplete...error about ratings.....


var ReviewSchema = new Schema({
	comment: {
		type: String,
		trim: true,
		required: 'Por favor ingrese un comentario.'
	},
	ratings: {
		type: [Rating],
		required: 'Por favor seleccione uno o mas ratings.',
		validate: [
			/*{validator: ReviewModelValidator.validateRatingsRequired, msg: 'Por favor seleccione uno o mas ratings.'},*/
			{validator: ReviewModelValidator.validateRatingsValues, msg: 'Uno o mas ratings seleccionados son invalidos.'}
		]
	},
	created: {
		type: Date,
		default: Date.now
	},
	recommend: {
		type: Boolean,
		default: null
	}
}/*,{_id: false}*/);

/** This allows the ratingsAvg virtual attribute (below) to be added to Job reviews
 *  when using the toJSON function.
 */
ReviewSchema.set('toJSON', {virtuals: true});

//ReviewSchema.path('ratings').validate(ReviewModelValidator.validateRatingsRequired, 'Por seleccione uno o mas ratings.');

/**
 Virtual to store the review ratings average.
 This will be returned when using the doc.toJSON method
 */
ReviewSchema.virtual('ratingsAvg').get(function(){

	return parseFloat(this.getRatingsAvg());

});

// TODO: check how services is implemented...on job schema...
// Services are declared as ref...while here we just specify the schema type...
// Can we add the ref here...too?
/*ReviewSchema.path('ratings').validate(function(ratings){
	return ratings.length;
}, 'Opa!');*/

/**
 Returns the review ratings average.
 */
ReviewSchema.methods.getRatingsAvg = function(){
	var ratingsTotal = 0;
	this.ratings.forEach(function(rating){
		ratingsTotal += rating.rate;
	});
	return (ratingsTotal / this.ratings.length).toFixed(2);

};

/**
 Returns the points the supplier gains, based on the ratings average.
 */
ReviewSchema.methods.getPointsFromRatingsAvg = function(){
	var ratingsAvg = this.getRatingsAvg();
	return _.find(config.staticdata.reviewRatingsAvgPointsRanges,function(reviewRatingsAvgPointsRange){
			return reviewRatingsAvgPointsRange.min <= ratingsAvg && ratingsAvg  <= reviewRatingsAvgPointsRange.max

	}).points;

};

/**
 Returns the points the supplier gains, based on the 'recommend to a friend' action.
 */
ReviewSchema.methods.getPointsFromRecommend = function(){
	var points = 0;
	if(this.recommend != null)
	{
		var recommendPoints =  _.find(config.staticdata.userSupplierActionPoints, _.matchesProperty('action_name','recommend'));
		points = this.recommend ? recommendPoints.points.yes : recommendPoints.points.no;
	}
	return points;
};

/**
 Returns the points the supplier gains, based on the different points associated to a review
 * (ratings average and 'recommend to a friend' for now.
 */
ReviewSchema.methods.getPoints = function(){

	var reviewPointsFromRatingsAvg;
	// TODO: this if condition is not preventing execution of getPointsFromRatingsAvg(),
	// since it seems default is to have ratings array as [0] when not submitted from client????
	// Maybe we should capture this during validation within reviews model?
	// Maybe needs validation as ReviewSchema.path('ratings').validate(function....)
	// with different declaration as (just like services are validated from job????:
	// ratings: [{
	// type: Schema.ObjectId,
	// ref: 'Rating'
    // }],
	if(this.ratings.length){
		reviewPointsFromRatingsAvg = this.getPointsFromRatingsAvg();
	}
	else{
		reviewPointsFromRatingsAvg = 0;
	}
	var reviewPointsFromRecommend = this.getPointsFromRecommend();
	return  parseFloat((reviewPointsFromRatingsAvg + reviewPointsFromRecommend).toFixed(2));


};

module.exports = ReviewSchema;