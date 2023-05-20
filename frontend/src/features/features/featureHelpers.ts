import { Feature, FeatureDataItem } from '../../app/services/features';
import {
	FeatureSchema,
	FeatureSchemaFieldDefinitionCollection,
	FeatureSchemaFieldType,
} from '../../app/services/schemas';

export const getDataItemFieldDefinitionFromSchema = (dataItem: FeatureDataItem, schema: FeatureSchema) =>
	schema.definition.find((fieldDefinition) => fieldDefinition.id === dataItem.schema_field_id);

export const getSymbolValueForFeatureDataItem = (
	dataItem: FeatureDataItem,
	fieldDefinition: FeatureSchemaFieldDefinitionCollection,
) => {
	if (fieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean) {
		return fieldDefinition.symbol;
	}
};

export const getFeatureDataItemForSchemaField = (
	fieldDefinition: FeatureSchemaFieldDefinitionCollection,
	feature: Feature,
) => feature.data.find((featureDataItem) => featureDataItem.schema_field_id === fieldDefinition.id);
