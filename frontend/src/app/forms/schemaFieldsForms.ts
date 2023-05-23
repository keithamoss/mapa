import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import { SchemaFormFieldsFormValues } from '../../features/schemaFields/schemaFieldDataEntryManager';
import { Feature } from '../services/features';
import {
	FeatureSchema,
	FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps,
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

export const getDefaultValuesForSchemaFieldForm = (schema: FeatureSchema, feature: Feature) => {
	const values: SchemaFormFieldsFormValues = {};

	schema.definition.forEach((fieldDefinition) => {
		const schemaFieldName = `schema_field_${fieldDefinition.id}`;

		const featureDataItemForSchemaField = feature.data.find(
			(featureDataItem) => featureDataItem.schema_field_id === fieldDefinition.id,
		);

		if (fieldDefinition.type === FeatureSchemaFieldType.TextField) {
			values[schemaFieldName] = featureDataItemForSchemaField?.value || '';
		} else if (
			fieldDefinition.type === FeatureSchemaFieldType.BooleanField ||
			fieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean
		) {
			values[schemaFieldName] = featureDataItemForSchemaField?.value || false;
		} else if (fieldDefinition.type === FeatureSchemaFieldType.NumberField) {
			values[schemaFieldName] = featureDataItemForSchemaField?.value || '';
		}
	});

	return values;
};
export const getYupValidationSchemaForSchemaFieldForm = (schema: FeatureSchema) => {
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
		}
	});

	return yup.object(values).required();
};
