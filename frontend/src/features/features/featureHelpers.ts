import { useAppSelector } from '../../app/hooks/store';
import { FeatureDataItem, MapaFeature } from '../../app/services/features';
import {
	FeatureSchema,
	FeatureSchemaFieldDefinitionCollection,
	FeatureSchemaFieldType,
} from '../../app/services/schemas';
import { selectFeatureSchemaById } from '../schemas/schemasSlice';
import { getSymbolNameBySymbolId } from '../symbology/symbologyHelpers';

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
	feature: MapaFeature,
) => feature.data.find((featureDataItem) => featureDataItem.schema_field_id === fieldDefinition.id);

export const getFeatureLabel = (feature: MapaFeature) => {
	if (feature.schema_id === null || feature.symbol_id === null) {
		return undefined;
	}

	// Need to assign to a variable first otherwise TypeScript thinks it's still number | null
	const schemaId = feature.schema_id;
	const schema = useAppSelector((state) => selectFeatureSchemaById(state, schemaId));

	const symbolName = getSymbolNameBySymbolId(feature.symbol_id, schema);
	return typeof symbolName === 'string' ? symbolName : undefined;
};
