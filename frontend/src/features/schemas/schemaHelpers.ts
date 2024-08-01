import { FeatureDataItem, MapaFeature } from '../../app/services/features';
import {
	FeatureSchema,
	FeatureSchemaFieldDefinitionCollection,
	FeatureSchemaFieldType,
} from '../../app/services/schemas';

export const getSchemaById = (schemaId: number | null, schemas: FeatureSchema[]) =>
	schemas.find((schema) => schema.id === schemaId && schemaId !== null);

export const getSchemaIdsUsedByFeatures = (features: MapaFeature[]) =>
	Array.from(
		new Set(
			Object.values(features || [])
				.map((f) => f.schema_id)
				.filter((schemaId): schemaId is number => typeof schemaId === 'number'),
		),
	);

export const getSchemasUsedByFeatures = (features: MapaFeature[], schemas: FeatureSchema[]) => {
	const schemaIdssUsedByFeatures = getSchemaIdsUsedByFeatures(features);
	return schemas.filter((s) => schemaIdssUsedByFeatures.includes(s.id));
};

export const isSchemaDataItemToBeUsed = (
	fieldDefinition: FeatureSchemaFieldDefinitionCollection,
	dataItem: FeatureDataItem | undefined,
) => {
	if (dataItem !== undefined) {
		if (fieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean) {
			return dataItem.value; // the value set in the field will decide if this data item is to be used or not
		}
	}

	return false;
};

export const isFieldDefinitionSymbology = (fieldDefinition: FeatureSchemaFieldDefinitionCollection) =>
	['symbology_field_boolean'].includes(fieldDefinition.type);

export const getFieldFromSchemaDefinitionById = (schema: FeatureSchema, schemaFieldId: number) =>
	schema.definition.find((f) => f.id === schemaFieldId);

export const getFirstFieldFromSchemaDefinitionByName = (schema: FeatureSchema, schemaFieldName: string) =>
	schema.definition.find((f) => f.name === schemaFieldName);

export const moveFieldUp = (fieldId: number, definition: FeatureSchemaFieldDefinitionCollection[]) => {
	const fieldIdx = definition.findIndex((f) => f.id === fieldId);

	if (fieldIdx !== -1 && fieldIdx > 0) {
		const local_definition = [...(definition || [])];
		const field = local_definition.splice(fieldIdx, 1)[0];
		const toFieldIdx = fieldIdx - 1;

		local_definition.splice(toFieldIdx, 0, field);

		return local_definition;
	}

	return null;
};

export const moveFieldDown = (fieldId: number, definition: FeatureSchemaFieldDefinitionCollection[]) => {
	const fieldIdx = definition.findIndex((f) => f.id === fieldId);

	if (fieldIdx !== -1 && fieldIdx < definition.length - 1) {
		const local_definition = [...(definition || [])];
		const field = local_definition.splice(fieldIdx, 1)[0];
		const toFieldIdx = fieldIdx + 1;

		local_definition.splice(toFieldIdx, 0, field);

		return local_definition;
	}

	return null;
};

export const removeField = (fieldId: number, definition: FeatureSchemaFieldDefinitionCollection[]) =>
	definition.filter((d) => d.id !== fieldId);
