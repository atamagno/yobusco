'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	_ = require('lodash'),
	config = require('../../config/config');

var Ratings = new Schema({
	type: {
		type: Schema.ObjectId,
		ref: 'RatingType',
		required: 'Por favor seleccione un tipo de rating'
	},
	rate: {
		type: Number,
		min: 0,
		max: 5,
		default: 3
	}
});

var ReviewSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	job: {
		type: Schema.ObjectId,
		ref: 'Job'
	},
	service_supplier: {
		type: Schema.ObjectId,
		ref: 'ServiceSupplier',
		required: 'Por favor seleccione un prestador de servicios'
	},
	services: [{
		type: Schema.ObjectId,
		ref: 'ServiceSubcategory'
	}],
	comment: {
		type: String,
		default: '',
		trim: true,
		required: 'Por favor ingrese un comentario'
	},
	ratings: [Ratings],
	created: {
		type: Date,
		default: Date.now
	},
	recommend: {
		type: Boolean,
		default: null
	}

});

/** This allows the ratingsAvg virtual attribute (below) to be added to Review documents when using the ToJSON function.
  */
ReviewSchema.set('toJSON', {virtuals: true});

/**
 Virtual to calculate the review ratings average.
 This will be returned when using the doc.toJSON method
 */
ReviewSchema.virtual('ratingsAvg').get(function(){

	return this.getRatingsAvg();

});

ReviewSchema.methods.getRatingsAvg = function()
{
	var ratingsTotal = 0;
	this.ratings.forEach(function(rating){
		ratingsTotal += rating.rate;
	})
	return (ratingsTotal / this.ratings.length).toFixed(2);

}

ReviewSchema.methods.getReviewPointsFromRatingsAvg = function()
{
	var ratingsAvg = this.getRatingsAvg();
	return _.find(config.staticdata.reviewRatingsAvgPointsRanges,function(reviewRatingsAvgPointsRange){
		return reviewRatingsAvgPointsRange.min <= ratingsAvg && ratingsAvg  <= reviewRatingsAvgPointsRange.max

	}).points;

}

ReviewSchema.methods.getReviewPointsFromRecommend = function()
{
	var points = 0;
	if(this.recommend != null)
	{
		var recommendPoints =  _.find(config.staticdata.userSupplierActionPoints, _.matchesProperty('action_name','recommend'));
		points = this.recommend ? recommendPoints.points.yes : recommendPoints.points.no;
	}
	return points;
}

/**
  Updates supplier overall_rating, review count, points and category
  considering the ratings in the review being added, and the existing ones.
*/
ReviewSchema.post('save',function(review){

		// TODO: upgrade to mongoose 4.x and use promises to avoid callback hell...
	    // .constructor allows accessing the Model associated to the document
		review.constructor.populate(review, {path: "service_supplier"}, function(err, review) {
			if(err){

				// TODO: add logging here stating that - service supplier associated to the review could not
				// be found, and consequently, the overall_rating field could not be updated.
				// Would this be possible at all?
			}
			else{
					review.constructor.getServiceSupplierRatingsAverage(review.service_supplier._id, function (err, ratingsAverage){
					if(err){
					  // TODO: same as above....
					}
					else{
							review.service_supplier.overall_rating = ratingsAverage[0].ratingsAvg.toFixed(2);
							review.service_supplier.reviewCount++;

							var reviewPoints = review.getReviewPointsFromRatingsAvg() +
								               review.getReviewPointsFromRecommend();

							// TODO: check how points are stored on DB.
						    // Seems it adds too many decimals and maybe not reflecting real points.
							review.service_supplier.points+= reviewPoints;
							var category = review.service_supplier.constructor.getServiceSupplierCategory(review.service_supplier.points)
							review.service_supplier.category = category._id;
							review.service_supplier.save(function(err){
							if(err){
								// TODO: add logging here too....
							}

						});
					}
				});
			}

		});

});

/** Pre save validation to verify if user is allowed to create a review for the specific supplier
 *  and the service/s submitted
 */
ReviewSchema.pre('save', function(next){

	// TODO: make limit configurable?
	var recentReviewLimitDate = new Date();
	recentReviewLimitDate.setMonth(recentReviewLimitDate.getMonth() - 1); // setting limit to a month ago..

	this.constructor.find(
		{user: this.user.toString(),
		 service_supplier: this.service_supplier.toString(),
		 services: {$in: this.services},
		 created: {$gt: recentReviewLimitDate}
		}, function(err, reviews) {
			if(err) {
				// TODO: add logging here...
				next(new Error()) // throwing an error with empty message will return the default message...
			}
			else{
					if(reviews.length) {
						next(new Error('No es posible agregar mas de un comentario para el mismo proveedor' +
						' y los mismos servicios en el periodo de un mes.'));

					}
					else {
						next();
					}

				}

		});

})


/**
 * Returns the ratings average, considering all the reviews for a given supplier.
 * Using aggregation
   See http://stackoverflow.com/questions/30289071/calculate-the-average-of-fields-in-mongodb for explanation
 */
ReviewSchema.statics.getServiceSupplierRatingsAverage = function (serviceSupplierId, callback)
{
	this.aggregate(
		[
			{ "$match": { "service_supplier": mongoose.Types.ObjectId(serviceSupplierId) } }, // docs to match
			{ "$unwind": "$ratings"},
			{ "$group": {
				"_id": null, // no need to group the grand total by using a specific field, since we want the grand total.
				//"ratingsSum" : { "$sum": "$ratings.rate" }, // calculate the ratings grand total here
				//"ratingsCount": { $sum: 1} // get total ratings considered in the sum (same as 'count' in SQL)
				"ratingsAvg" : {"$avg" : "$ratings.rate"}
			}}
		], function (err, ratingsAverage) {

			if (err)
				callback(err, null)
			else
				callback(null, ratingsAverage)

		});


}

/**
 * Returns list of reviews for a specific service supplier, and adds
 * the ratings average of each review as a calculated field.
 */
ReviewSchema.statics.listByServiceSupplierWithAverage = function (serviceSupplierId, callback)
{
	var Review = this;
	Review.aggregate([
		{ "$match": {"service_supplier": mongoose.Types.ObjectId(serviceSupplierId)} }, // docs to match
		{ "$unwind": "$ratings"},  // split the ratings array in order to calculate the average (see below)
								   // this results in one doc per rating as an output
		{ "$group": {
			"_id": "$_id", // group the calculated fields by review id (we group the docs that were split above, using their _id)
			"user" : {"$first" : "$user"}, // return the user of the first doc (since it's the same for all docs after unwind)
			"created": {"$first" : "$created"}, // same here and for services + comment
			"services": {"$first" : "$services"},
			"comment": {"$first" : "$comment"},
			"ratings" : { "$push": "$ratings"}, // push the original ratings array so we also return it
			"ratingsAvg" : { "$avg": "$ratings.rate" } // calculate the average here
		}},
		{ "$sort": {"created": -1}} // sort by date, showing the most current first
	], function (err, reviews){

		if (err) {
			callback(err, null);

		} else {

			// TODO: do we need this always? Should we just use it from the calling function when needed?
			// Or maybe just get a flag on this function to populate / not populate?
			// populating the user associated to each review
			Review.populate(reviews, {path: "user"},function(err, reviews) {
				if (err)	{
					callback(err, null);
				} else {
					callback(null, reviews);
				}

			});
		}
	});
}




mongoose.model('Review', ReviewSchema);
