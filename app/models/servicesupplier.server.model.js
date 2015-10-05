'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ServiceSupplierSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill service supplier name',
		trim: true
	},
	city: {
		type: String,
		default: '',
		trim: true
	},
	phone: {
		type: String,
		default: '',
		trim: true
	},
	generalDescription: {
		type: String,
		default: '',
		trim: true
	},
	reviews: [{
		type: Schema.ObjectId,
		ref: 'Review'
	}],
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('ServiceSupplier', ServiceSupplierSchema);
