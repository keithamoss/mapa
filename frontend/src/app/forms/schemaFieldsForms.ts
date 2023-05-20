import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import {
	FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps,
	FeatureSchemaFieldDefinitionNumberFieldFormModifiableProps,
	FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps,
	FeatureSchemaFieldDefinitionTextFieldFormModifiableProps,
} from '../services/schemas';
import { symbologyFormValidationSchema } from './symbologyForm';

export const schemaTextFieldFormValidationSchema: ObjectSchema<FeatureSchemaFieldDefinitionTextFieldFormModifiableProps> =
	yup
		.object({
			name: yup.string().required(),
			default_value: yup.string().ensure().defined(),
			required_field: yup.boolean().required(),
		})
		.required();

export const schemaNumberFieldFormValidationSchema: ObjectSchema<FeatureSchemaFieldDefinitionNumberFieldFormModifiableProps> =
	yup
		.object({
			name: yup.string().required(),
			default_value: yup
				.number()
				.transform((_, val) => (Number.isNaN(Number(val)) === false ? Number(val) : 0))
				.defined(),
		})
		.required();

export const schemaBooleanFieldFormValidationSchema: ObjectSchema<FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps> =
	yup
		.object({
			name: yup.string().required(),
			default_value: yup.boolean().required(),
		})
		.required();

export const schemaSymbologyBooleanFieldFormValidationSchema: ObjectSchema<FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps> =
	yup
		.object({
			name: yup.string().required(),
			default_value: yup.boolean().required(),
			symbol: symbologyFormValidationSchema(false, false),
		})
		.required();
