'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Review = require('./review.server.model'),
	ApprovalChallengeDetailModelValidator = require('./helpers/validators/approvalchallengedetail.server.model.validator.js'),
	config = require(__base + 'config/config');

/**
 * Approval Challenge Detail Schema
 */
var ApprovalChallengeDetailSchema = new Schema({
		status: {
			type: Schema.ObjectId,
			ref: 'JobStatus',
			required: 'Por favor seleccione un estado para rechazar el trabajo.',
			validate: [
				{validator:ApprovalChallengeDetailModelValidator.validateStatusValue, msg: 'Por favor seleccione un estado valido para rechazar el trabajo.'},
				{validator:ApprovalChallengeDetailModelValidator.validateStatusPermission, msg: 'El estado seleccionado no esta permitido para el usuario.'},
				{validator:ApprovalChallengeDetailModelValidator.validateStatusChallenged, msg: 'No es posible rechazar el trabajo utilizando el estado y/o razon de estado seleccionado/a.'},
				{validator:ApprovalChallengeDetailModelValidator.validateReviewRequired, msg: 'Es necesario calificar al prestador de servicios para rechazar el trabajo.'},
				{validator:ApprovalChallengeDetailModelValidator.validateReviewNotAllowedByStatus, msg: 'No es posible agregar una calificacion utilizando el estado seleccionado.'},
				{validator:ApprovalChallengeDetailModelValidator.validateReviewNotAllowedByServiceSupplier, msg: 'No es posible agregar una calificacion como prestador de servicios.'}
			]

		},
		comments: {
			type: String
		},
		created: {
			type: Date,
			default: Date.now
		},
		status_reason:{
			type: Schema.ObjectId,
			ref: 'JobStatusReason',
			required: [ApprovalChallengeDetailModelValidator.validateStatusReasonRequired, 'Por favor seleccione una opcion de razon de estado/resultado para rechazar el trabajo.'],
			validate: [
				{validator: ApprovalChallengeDetailModelValidator.validateStatusReasonValue,msg: 'Por favor seleccione una opcion valida de razon de estado/resultado para rechazar el trabajo.' },
				{validator: ApprovalChallengeDetailModelValidator.validateStatusReasonPermission,msg: 'La razon de estado/resultado no esta permitida para el usuario.' }
			]
		}
	},
	{_id: false}
);

module.exports = ApprovalChallengeDetailSchema;