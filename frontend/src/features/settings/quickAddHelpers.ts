import { sortBy } from 'lodash-es';
import { QuickAddMode, UserProfileSettings } from '../../app/services/auth';
import { MapaFeature } from '../../app/services/features';
import { FeatureSchema, FeatureSchemaSymbologySymbolsValue } from '../../app/services/schemas';
import { getSchemaById, getSchemasUsedByFeatures } from '../schemas/schemaHelpers';
import { getSymbolFromSchemaSymbology, getSymbolsFavouritedForMap } from '../symbology/symbologyHelpers';

export const getQuickAddModeOrDefault = (userProfileSettings: UserProfileSettings) =>
	userProfileSettings.quick_add_mode || QuickAddMode.Recent;

export const getQuickAddSymbolCountOrDefault = (userProfileSettings: UserProfileSettings) =>
	userProfileSettings.quick_add_symbol_count || 4;

interface SchemaIdAndSymbolId {
	schemaId: number;
	symbolId: number;
}

interface SchemaIdAndSymbolIdWithCount extends SchemaIdAndSymbolId {
	count: number;
}

interface SymbolAndSchema {
	symbol: FeatureSchemaSymbologySymbolsValue;
	schema: FeatureSchema;
}

const getSymbolsAndSchemaFromIds = (data: SchemaIdAndSymbolId[], schemas: FeatureSchema[]) =>
	data
		.map((item) => {
			const schema = getSchemaById(item.schemaId, schemas);
			if (schema === undefined) {
				return;
			}

			const symbol = getSymbolFromSchemaSymbology(item.symbolId, schema.symbology);
			if (symbol === undefined) {
				return;
			}

			return { symbol, schema };
		})
		.filter((item): item is SymbolAndSchema => item !== undefined);

const getRecentlyAddedSymbols = (quickAddSymbolCount: number, features: MapaFeature[], schemas: FeatureSchema[]) => {
	// Sort features by the date they were added
	const featuresByDateAdded = sortBy(features, ['creation_date']).reverse();

	// Tally up the number of uses of each reecently added symbol (until we hit our quota)
	const recentlyAddedSymbolsRanked: { [key: string]: SchemaIdAndSymbolId } = {};

	for (const f of featuresByDateAdded) {
		if (f.schema_id !== null && f.symbol_id !== null) {
			const key = `${f.schema_id}.${f.symbol_id}`;

			if (recentlyAddedSymbolsRanked[key] === undefined) {
				recentlyAddedSymbolsRanked[key] = {
					schemaId: f.schema_id,
					symbolId: f.symbol_id,
				};
			}

			if (Object.keys(recentlyAddedSymbolsRanked).length >= quickAddSymbolCount) {
				break;
			}
		}
	}

	return getSymbolsAndSchemaFromIds(Object.values(recentlyAddedSymbolsRanked), schemas);
};

const getPopularSymbols = (quickAddSymbolCount: number, features: MapaFeature[], schemas: FeatureSchema[]) => {
	// Tally up the number of uses of each symbol on the map
	const symbolsTally: {
		[key: string]: SchemaIdAndSymbolIdWithCount;
	} = {};

	features.forEach((f) => {
		if (f.schema_id !== null && f.symbol_id !== null) {
			const key = f.symbol_id;

			if (symbolsTally[key] === undefined) {
				symbolsTally[key] = {
					schemaId: f.schema_id,
					symbolId: f.symbol_id,
					count: 0,
				};
			}

			symbolsTally[key].count += 1;
		}
	});

	// ... and rank them by popularity and give us the last [n] symbols (with the most popular ones first)
	const popularSymbolsRanked = sortBy(symbolsTally, ['count']).slice(-quickAddSymbolCount).reverse();

	return getSymbolsAndSchemaFromIds(popularSymbolsRanked, schemas);
};

const getFavouritedSymbols = (
	quickAddSymbolCount: number,
	features: MapaFeature[],
	schemas: FeatureSchema[],
	mapId: number,
) => {
	// Get all of the favourited symbols in use on the map
	let favouritedSymbolsInUse: string[] = [];
	getSchemasUsedByFeatures(features, schemas).forEach((s) => {
		favouritedSymbolsInUse = [
			...favouritedSymbolsInUse,
			...getSymbolsFavouritedForMap(s.symbology, mapId).map((sy) => `${s.id}.${sy.id}`),
		];
	});

	// Tally up the number of uses of each favourited symbol
	const favouritedSymbolsTally: {
		[key: string]: SchemaIdAndSymbolIdWithCount;
	} = {};

	features.forEach((f) => {
		if (
			f.schema_id !== null &&
			f.symbol_id !== null &&
			favouritedSymbolsInUse.includes(`${f.schema_id}.${f.symbol_id}`)
		) {
			const key = `${f.schema_id}.${f.symbol_id}`;

			if (favouritedSymbolsTally[key] === undefined) {
				favouritedSymbolsTally[key] = {
					schemaId: f.schema_id,
					symbolId: f.symbol_id,
					count: 0,
				};
			}

			favouritedSymbolsTally[key].count += 1;
		}
	});

	// ... and rank them by popularity and give us the last [n] symbols (with the most popular ones first)
	const favouritedSymbolsRanked = sortBy(favouritedSymbolsTally, ['count']).slice(-quickAddSymbolCount).reverse();

	return getSymbolsAndSchemaFromIds(favouritedSymbolsRanked, schemas);
};

export const getQuickAddSymbols = (
	quickAddMode: QuickAddMode,
	quickAddSymbolCount: number,
	features: MapaFeature[],
	schemas: FeatureSchema[],
	mapId: number,
) => {
	switch (quickAddMode) {
		case QuickAddMode.Recent:
			return getRecentlyAddedSymbols(quickAddSymbolCount, features, schemas);
		case QuickAddMode.Popular:
			return getPopularSymbols(quickAddSymbolCount, features, schemas);
		case QuickAddMode.Favourite:
			return getFavouritedSymbols(quickAddSymbolCount, features, schemas, mapId);
		default:
			return [];
	}
};
