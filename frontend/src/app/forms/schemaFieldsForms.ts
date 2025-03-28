import dayjs from 'dayjs';
import * as yup from 'yup';
import { AnyObject, ObjectSchema } from 'yup';
import { SchemaFormFieldsFormValues } from '../../features/schemaFields/schemaFieldDataEntryManager';
import { MapaFeature, NewMapaFeature } from '../services/features';
import {
	FeatureSchema,
	FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps,
	FeatureSchemaFieldDefinitionDateFieldFormModifiableProps,
	FeatureSchemaFieldDefinitionNumberFieldFormModifiableProps,
	FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps,
	FeatureSchemaFieldDefinitionTextFieldFormModifiableProps,
	FeatureSchemaFieldType,
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

export const schemaDateFieldFormValidationSchema: ObjectSchema<FeatureSchemaFieldDefinitionDateFieldFormModifiableProps> =
	yup
		.object({
			name: yup.string().required(),
			default_value: yup
				.string()
				// Ensures DayJS objects are turned into ISO8601 fields
				// It will be a string if there is no default (i.e. '')
				// or if we are editing an existing field that was already saved as ISO8601
				// it will be a DayJS object if we are creating the field for the first time and
				// it will be null if the user has (a) cleared the field or (b) only clicked once when chosing a date
				// https://day.js.org/docs/en/display/format
				.transform((_, val: string | dayjs.Dayjs) => (typeof val === 'string' ? val : val !== null ? val.format() : ''))
				// Doesn't actually seemed to be needed (converts null and undefiend to an empty string)
				// .ensure()
				.defined(),
			required_field: yup.boolean().required(),
		})
		.required();

export const getDefaultValuesForSchemaFieldForm = (schema: FeatureSchema, feature: MapaFeature | NewMapaFeature) => {
	const values: SchemaFormFieldsFormValues = {};

	schema.definition.forEach((fieldDefinition) => {
		const schemaFieldName = `schema_field_${fieldDefinition.id}`;

		const featureDataItemForSchemaField = feature.data.find(
			(featureDataItem) => featureDataItem.schema_field_id === fieldDefinition.id,
		);

		if (
			fieldDefinition.type === FeatureSchemaFieldType.TextField ||
			fieldDefinition.type === FeatureSchemaFieldType.BooleanField ||
			fieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean ||
			fieldDefinition.type === FeatureSchemaFieldType.NumberField ||
			fieldDefinition.type === FeatureSchemaFieldType.DateField
		) {
			values[schemaFieldName] =
				featureDataItemForSchemaField?.value !== undefined
					? featureDataItemForSchemaField?.value
					: fieldDefinition.default_value;
		}
	});

	return values;
};
export const getYupValidationSchemaForSchemaFieldForm = (schema: FeatureSchema): ObjectSchema<AnyObject> => {
	const values: yup.ObjectShape = {};

	schema.definition.forEach((fieldDefinition) => {
		const schemaFieldName = `schema_field_${fieldDefinition.id}`;

		// Note: The undefined transforms here ensures that empty form fields are not included in what's passed to onDoneWithForm

		if (fieldDefinition.type === FeatureSchemaFieldType.TextField) {
			const validator = yup.string().transform((_, val) => (val !== '' ? String(val) : undefined));
			values[schemaFieldName] = fieldDefinition.required_field === true ? validator.required() : validator.optional();
		} else if (
			fieldDefinition.type === FeatureSchemaFieldType.BooleanField ||
			fieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean
		) {
			values[schemaFieldName] = yup.boolean().optional();
		} else if (fieldDefinition.type === FeatureSchemaFieldType.NumberField) {
			values[schemaFieldName] = yup
				.number()
				.transform((_, val) => (val !== '' ? Number(val) : undefined))
				.optional();
		} else if (fieldDefinition.type === FeatureSchemaFieldType.DateField) {
			const validator = yup
				.string()
				// See comments above in schemaDateFieldFormValidationSchema()
				.transform((_, val: string | dayjs.Dayjs) =>
					typeof val === 'string' ? val : val !== null ? val.format() : '',
				);
			values[schemaFieldName] = fieldDefinition.required_field === true ? validator.required() : validator.optional();
		}
	});

	return yup.object(values).required();
};
