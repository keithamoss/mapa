import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import { FeatureSchemaFieldDefinitionCollection, FeatureSchemaModifiableProps } from '../services/schemas';
import { symbologyFormValidationSchema } from './symbologyForm';

export const schemaFormValidationSchema: ObjectSchema<FeatureSchemaModifiableProps> = yup
	.object({
		name: yup.string().required(),
		definition: yup.array().ensure().required(),
		symbology: yup
			.object({
				groups: yup.array().required(),
				symbols: yup.array().required(),
			})
			.required(),
		default_symbology: symbologyFormValidationSchema(false, false),
		recently_used_symbols: yup.object({}).defined(),
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
