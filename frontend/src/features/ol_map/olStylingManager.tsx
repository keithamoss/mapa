import Feature from 'ol/Feature';
import { Icon } from 'ol/style';
import Style from 'ol/style/Style';

import { MapaFeature } from '../../app/services/features';
import { FeatureSchema, FeatureSchemaFieldType, SymbologyProps } from '../../app/services/schemas';
import { getFeatureDataItemForSchemaField, getSymbolValueForFeatureDataItem } from '../features/featureHelpers';
import { getSchemaById, isFieldDefinitionSymbology, isSchemaDataItemToBeUsed } from '../schemas/schemaHelpers';
import {
	getAppDefaultSymbologyConfig,
	getFontAwesomeIconForSymbolAsSVGString,
	getSymbolFromSchemaSymbology,
} from '../symbology/symbologyHelpers';

const styleCache: { [key: string]: Style } = {};

export const getIconForSymbologyConfig = (olFeature: Feature, symbologyConfig: Partial<SymbologyProps>) => {
	const icon = getFontAwesomeIconForSymbolAsSVGString(symbologyConfig);

	if (icon === null) {
		return null;
	}

	return new Style({
		image: new Icon({
			src: `data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?>${icon}`,
			// According to https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210, this forces the icon to be rendered to a canvas internally (whilst not changing the colour).
			// This should result in a performance improvement.
			// Untested, but it doesnt't appear to do any harm.
			color: 'white',
		}),
	});
};

export const olStyleFunction = (olFeature: Feature) => {
	// Note this isn't strictly speaking one of our Features, because we don't have our 'geom' field (but we don't need it, so...)
	// @TODO Build the feature from the untyped props from scratch (so we can detect anything missing) or find a way to make OL geometry TypeScript typed.
	const feature = olFeature.getProperties() as MapaFeature;

	if (feature.symbolCacheKey !== undefined && styleCache[feature.symbolCacheKey] !== undefined) {
		// console.log("cache hit");
		return styleCache[feature.symbolCacheKey];
	} else {
		// console.log("cache miss");
	}

	if (feature.symbol !== undefined) {
		const symbol = getIconForSymbologyConfig(olFeature, feature.symbol);

		if (feature.symbolCacheKey !== undefined && symbol !== null) {
			styleCache[feature.symbolCacheKey] = symbol;
		}

		return symbol;
	}
};

export const determineSymbolForFeature = (
	feature: MapaFeature,
	defaultMapSymbology: SymbologyProps | null,
	featureSchemas: FeatureSchema[],
) => {
	let symbologyConfig = {
		...getAppDefaultSymbologyConfig(),
		...defaultMapSymbology,
	};

	const schema = getSchemaById(feature.schema_id, featureSchemas);

	if (schema !== undefined) {
		if (schema.default_symbology !== null) {
			symbologyConfig = { ...symbologyConfig, ...schema.default_symbology };
		}

		// Add in the symbol from the schema directly assigned to the feature
		if (feature.symbol_id !== null) {
			const symbol = getSymbolFromSchemaSymbology(feature.symbol_id, schema.symbology);

			if (symbol !== undefined) {
				symbologyConfig = { ...symbologyConfig, ...symbol.props };
			}
		}

		// Add in any symbology config present in the schema data items (e.g. checkboxes modifying symbology)
		// We use the schema field order to loop through the field definitions
		// because feature data items don't have any inherent order
		schema.definition
			.filter((fieldDefinition) => isFieldDefinitionSymbology(fieldDefinition) === true)
			.forEach((fieldDefinition) => {
				const dataItem = getFeatureDataItemForSchemaField(fieldDefinition, feature);

				// The user has provided data for this field on the feature
				if (dataItem !== undefined && isSchemaDataItemToBeUsed(fieldDefinition, dataItem)) {
					const symbologyValue = getSymbolValueForFeatureDataItem(dataItem, fieldDefinition);

					// NOTE: These aren't strictly speaking SymbologyValue entities because they contain non-symbology fields (e.g. the name of the symbol that appears in the schema)
					symbologyConfig = { ...symbologyConfig, ...symbologyValue };
				} else {
					// The user hasn't provided data for this field, but there may still be a default value
					if (
						fieldDefinition.type === FeatureSchemaFieldType.SymbologyFieldBoolean &&
						fieldDefinition.default_value === true
					) {
						symbologyConfig = { ...symbologyConfig, ...fieldDefinition.symbol };
					}
				}
			});
	}

	return {
		symbolCacheKey: Object.values(symbologyConfig).join(''),
		symbol: symbologyConfig as Partial<SymbologyProps>,
	};
};
