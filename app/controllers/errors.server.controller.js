'use strict';

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
	var output;

	try {
		var fieldValue = err.err.substring(err.err.lastIndexOf('{') + 5, err.err.lastIndexOf('" }'));
		output = fieldValue + ' ya existe';

	} catch (ex) {
		output = 'El campo \u00fanico ya existe';
	}

	return output;
};

/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
	var message = 'Algo sali\u00f3 mal, por favor intente m\u00e1s tarde';

	// single error message...
	if(err.message) {
		message = err.message;
	}

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = getUniqueErrorMessage(err);
				break;
			default:
				message = 'Algo sali\u00f3 mal, por favor intente m\u00e1s tarde';
		}
	} else if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};