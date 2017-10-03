'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Por favor ingrese un nombre']
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Por favor ingrese un apellido']
	},
	displayName: { //TODO: rename to display_name (to align with service supplier)
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		unique: 'La direcci\u00f3n de email ya existe',
		validate: [validateLocalStrategyProperty, 'Por favor ingrese una direcci\u00f3n de email'],
		match: [/.+\@.+\..+/, 'Por favor ingrese una direcci\u00f3n de email v\u00e1lida']
	},
	username: {
		type: String,
		unique: 'El nombre de usuario ya existe',
		required: 'Por favor ingrese un nombre de usuario',
		trim: true
	},
    city: {
        type: Schema.ObjectId,
        ref: 'City'
    },
	profile_picture: {
		type: String,
		default: 'modules/users/img/profile/default.png'
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'La contrase\u00F1a debe ser mas larga']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider es requerido'
	},
	oauthProvidersData: [],
	roles: {
		type: [{
			type: String,
			enum: ['user', 'servicesupplier', 'admin']
		}],
		default: ['user']
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	},
	isEmailValidated: {
		type: Boolean,
		default: false
	}
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 6) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	//if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
	//} else {
	//	return password;
	//}*/
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};


mongoose.model('User', UserSchema);