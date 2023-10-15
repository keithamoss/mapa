/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import dayjs from 'dayjs';
import MiniSearch from 'minisearch';
import { Feature } from '../../app/services/features';
import { FeatureSchema, FeatureSchemaFieldType, FeatureSchemaSymbology } from '../../app/services/schemas';
import { SearchField } from '../app/appSlice';
import { getFeatureDataItemForSchemaField } from '../features/featureHelpers';
import { getSymbolNameBySymbolId } from '../symbology/symbologyHelpers';

export const isSearchingYet = (search_term: string) => search_term.length >= 3;

export interface FeatureSearchResult {
	id: number;
	match: {
		[key: string]: string[];
	};
	score: number;
	terms: string[];
	map_id: number;
	schema_id: number;
	symbol_id: number;
	symbol_name: string;
	text_fields: string[];
}

export const searchFeatures = (
	features: Feature[],
	schemas: FeatureSchema[],
	search_term: string,
	search_fields: SearchField[],
) => {
	if (isSearchingYet(search_term) === false) {
		return [];
	}

	const miniSearch = new MiniSearch({
		fields: search_fields, // Fields to index for full-text search
		storeFields: [...search_fields, 'map_id', 'schema_id', 'symbol_id'], // Fields to return with search results
		searchOptions: {
			boost: { name: 3, categories: 1.5 }, // Fields to boost in the results
			prefix: true, // Prefix search (so that 'moto' will match 'motorcycle')
			combineWith: 'AND', // Combine terms with AND, not OR
			// Fuzzy search with a max edit distance of 0.2 * term length,
			// rounded to nearest integer. The mispelled 'ismael' will match 'ishmael'.
			// fuzzy: 0.2,
		},
		// Access schema-derived fields and nested fields (and regular top-level fields)
		extractField: (document, fieldName) => {
			if (fieldName === 'symbol_name') {
				const schema = schemas.find((s) => s.id === document.schema_id);
				return schema !== undefined ? getSymbolNameBySymbolId(document.symbol_id, schema) : null;
			} else if (fieldName === 'text_fields') {
				const schema = schemas.find((s) => s.id === document.schema_id);

				if (schema !== undefined) {
					return schema.definition
						.filter((f) => f.type === FeatureSchemaFieldType.TextField)
						.map((f) => {
							const dataItem = getFeatureDataItemForSchemaField(f, document);

							return dataItem !== undefined ? dataItem.value : f.default_value;
						});
				}

				return null;
			} else if (fieldName === 'date_fields') {
				// Hacky, but it'll do.
				// Ref: https://github.com/lucaong/minisearch/issues/173
				// ^ suggests we might need to add an entirely separate layer of date searching alongside (via DayJS?)
				const schema = schemas.find((s) => s.id === document.schema_id);

				if (schema !== undefined) {
					return schema.definition
						.filter((f) => f.type === FeatureSchemaFieldType.DateField)
						.map((f) => {
							const dataItem = getFeatureDataItemForSchemaField(f, document);

							return dataItem !== undefined && typeof dataItem.value === 'string'
								? dayjs(dataItem.value).format('DD/MM/YYYY')
								: typeof f.default_value === 'string'
								? dayjs(f.default_value).format('DD/MM/YYYY')
								: '';
						});
				}

				return null;
			}

			// Unpack nested fields
			return fieldName.split('.').reduce((doc, key) => doc && doc[key], document);
		},
	});

	// Index all documents
	miniSearch.addAll(Object.values(features));

	return miniSearch.search(search_term) as FeatureSearchResult[];
};

export interface SymbolSearchResult {
	id: number;
	match: {
		[key: string]: string[];
	};
	score: number;
	terms: string[];
	'prop.name': string;
}

export const searchSymbols = (
	symbology: FeatureSchemaSymbology,
	search_term: string,
	search_fields = ['props.name'],
) => {
	if (isSearchingYet(search_term) === false) {
		return [];
	}

	const miniSearch = new MiniSearch({
		fields: search_fields, // Fields to index for full-text search
		storeFields: [...search_fields], // Fields to return with search results
		searchOptions: {
			// boost: {  }, // Fields to boost in the results
			prefix: true, // Prefix search (so that 'moto' will match 'motorcycle')
			combineWith: 'AND', // Combine terms with AND, not OR
			// Fuzzy search with a max edit distance of 0.2 * term length,
			// rounded to nearest integer. The mispelled 'ismael' will match 'ishmael'.
			fuzzy: 2,
		},
		// Access schema-derived fields and nested fields (and regular top-level fields)
		extractField: (document, fieldName) => {
			// Unpack nested fields
			return fieldName.split('.').reduce((doc, key) => doc && doc[key], document);
		},
	});

	// Index all documents
	miniSearch.addAll(symbology.symbols);

	return miniSearch.search(search_term) as SymbolSearchResult[];
};
