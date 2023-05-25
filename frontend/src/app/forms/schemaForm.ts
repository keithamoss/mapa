import * as yup from 'yup';
import { FeatureSchemaFieldDefinitionCollection } from '../services/schemas';
import { symbologyFormValidationSchema } from './symbologyForm';

export const schemaFormValidationSchema = yup
	.object({
		name: yup.string().required(),
		definition: yup.array().notRequired(),
		symbology: yup.object().required(),
		default_symbology: symbologyFormValidationSchema(false, false),
		recently_used_symbols: yup.object().required(),
	})
	.required();

export const getStringOrEmptyStringForSchemasFieldsFormField = (
	schemaField: Partial<FeatureSchemaFieldDefinitionCollection> | null | undefined,
	fieldName: keyof FeatureSchemaFieldDefinitionCollection,
) =>
	schemaField === undefined || schemaField === null || schemaField[fieldName] === undefined
		? ''
		: // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		  `${schemaField[fieldName]}`;

export const getNumberOrZeroForSchemasFieldsFormField = (
	schemaField: Partial<FeatureSchemaFieldDefinitionCollection> | null | undefined,
	fieldName: keyof FeatureSchemaFieldDefinitionCollection,
) =>
	schemaField === undefined || schemaField === null || schemaField[fieldName] === undefined
		? 0
		: Number(schemaField[fieldName]);
