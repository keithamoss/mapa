import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { prepareFeaturesForMap } from '../../features/app/appSlice';
import { api } from './api';

export interface SymbologyProps {
	name?: string;
	icon?: string;
	// @NOTE: This could be strictly typed to IconStyle, rather than string, ...
	// but it's bit of a pfaff: https://yidaotus.medium.com/using-yup-and-typescript-for-typesafe-select-validation-e9ee9d4bceec
	icon_family?: string;
	icon_style?: string;
	size?: number;
	rotation?: number;
	colour?: string;
	opacity?: number;
	secondary_colour?: string;
	secondary_opacity?: number;
}

export interface FeatureSchemaSymbologySymbolsValue {
	id: number;
	group_id: number;
	props: SymbologyProps;
	favourited_map_ids: number[];
}

export interface FeatureSchemaSymbologyGroupModifiableProps {
	name: string;
}

export interface FeatureSchemaSymbologyGroup extends FeatureSchemaSymbologyGroupModifiableProps {
	id: number;
}

export interface FeatureSchemaSymbology {
	groups: FeatureSchemaSymbologyGroup[];
	symbols: FeatureSchemaSymbologySymbolsValue[];
}

export interface FeatureSchemaModifiableProps {
	name: string;
	definition: FeatureSchemaFieldDefinitionCollection[];
	symbology: FeatureSchemaSymbology;
	default_symbology: SymbologyProps | null;
	recently_used_symbols: {
		[key: number]: number[];
	};
}

export type NewFeatureSchema = FeatureSchemaModifiableProps;

export interface FeatureSchema extends FeatureSchemaModifiableProps {
	id: number;
	owner_id: number;
}

export enum FeatureSchemaFieldType {
	TextField = 'text_field',
	NumberField = 'number_field',
	BooleanField = 'boolean_field',
	SymbologyFieldBoolean = 'symbology_field_boolean',
}

export enum FeatureSchemaFieldTypeLabel {
	text_field = 'Text field',
	number_field = 'Number field',
	boolean_field = 'Boolean field',
	symbology_field_boolean = 'Symbology field boolean',
}

export type FeatureSchemaFieldDefinitionTextFieldFormModifiableProps = {
	name: string;
	default_value: string;
	required_field: boolean;
};

export type FeatureSchemaFieldDefinitionTextField = FeatureSchemaFieldDefinitionTextFieldFormModifiableProps & {
	type: FeatureSchemaFieldType.TextField;
	id: number;
};

export type FeatureSchemaFieldDefinitionNumberFieldFormModifiableProps = {
	name: string;
	default_value: number;
};

export type FeatureSchemaFieldDefinitionNumberField = FeatureSchemaFieldDefinitionNumberFieldFormModifiableProps & {
	type: FeatureSchemaFieldType.NumberField;
	id: number;
};

export type FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps = {
	name: string;
	default_value: boolean;
};

export type FeatureSchemaFieldDefinitionBooleanField = FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps & {
	type: FeatureSchemaFieldType.BooleanField;
	id: number;
};

export type FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps = {
	name: string;
	default_value: boolean;
	symbol: SymbologyProps;
};

export type FeatureSchemaFieldDefinitionSymbologyBoolean =
	FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps & {
		type: FeatureSchemaFieldType.SymbologyFieldBoolean;
		id: number;
	};

export type FeatureSchemaFieldDefinitionFormModifiablePropsCollection =
	| FeatureSchemaFieldDefinitionTextFieldFormModifiableProps
	| FeatureSchemaFieldDefinitionNumberFieldFormModifiableProps
	| FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps
	| FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps;

export type FeatureSchemaFieldDefinitionCollection =
	| FeatureSchemaFieldDefinitionTextField
	| FeatureSchemaFieldDefinitionNumberField
	| FeatureSchemaFieldDefinitionBooleanField
	| FeatureSchemaFieldDefinitionSymbologyBoolean;

export type NewFeatureSchemaFieldDefinitionCollection = Omit<FeatureSchemaFieldDefinitionCollection, 'id'>;

type FeatureSchemasResponse = FeatureSchema[];

interface CanDeleteSchemaSymbolRequest {
	schemaId: number;
	symbolId: number;
}

interface CanDeleteSchemaFieldRequest {
	schemaId: number;
	fieldId: number;
}

export interface CanDeleteSchemaThingResponse {
	deletable: boolean;
	count: number;
	count_by_map: { map_id: number; count: number }[];
}

export const featureSchemasAdapter = createEntityAdapter<FeatureSchema>();

const initialState = featureSchemasAdapter.getInitialState();
export { initialState as initialFeatureSchemasState };

export const featureSchemasApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getFeatureSchemas: builder.query<EntityState<FeatureSchema>, void>({
			query: () => 'schemas/',
			transformResponse: (res: FeatureSchemasResponse) => {
				return featureSchemasAdapter.setAll(initialState, res);
			},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			providesTags: (result, error, arg) => [
				{ type: 'FeatureSchema', id: 'LIST' },
				...(result !== undefined ? result.ids.map((id) => ({ type: 'FeatureSchema' as const, id })) : []),
			],
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				await queryFulfilled;
				dispatch(prepareFeaturesForMap());
			},
		}),
		addFeatureSchema: builder.mutation<FeatureSchema, Partial<FeatureSchema>>({
			query: (initialFeatureSchema) => ({
				url: 'schemas/',
				method: 'POST',
				body: initialFeatureSchema,
			}),
			invalidatesTags: [{ type: 'FeatureSchema', id: 'LIST' }],
		}),
		updateFeatureSchema: builder.mutation<FeatureSchema, Partial<FeatureSchema>>({
			query: (featureSchema) => ({
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				url: `schemas/${featureSchema.id}/`,
				method: 'PUT',
				body: featureSchema,
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'FeatureSchema', id }],
		}),
		patchFeatureSchema: builder.mutation<FeatureSchema, Partial<FeatureSchema>>({
			query: (schema) => ({
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				url: `schemas/${schema.id}/`,
				method: 'PATCH',
				body: schema,
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'FeatureSchema', id }],
		}),
		checkCanDeleteFeatureSchema: builder.query<CanDeleteSchemaThingResponse, number>({
			query: (id) => `schemas/${id}/can_delete/`,
		}),
		deleteSchema: builder.mutation<FeatureSchema, number>({
			query: (id) => ({
				url: `schemas/${id}/`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, id) => [
				{ type: 'FeatureSchema', id },
				{ type: 'Map', id: 'LIST' },
			],
		}),
		checkCanDeleteSymbol: builder.query<CanDeleteSchemaThingResponse, CanDeleteSchemaSymbolRequest>({
			query: ({ schemaId, symbolId }) => ({
				url: `schemas/${schemaId}/can_delete_symbol/`,
				params: { symbolID: symbolId },
			}),
		}),
		checkCanDeleteField: builder.query<CanDeleteSchemaThingResponse, CanDeleteSchemaFieldRequest>({
			query: ({ schemaId, fieldId }) => ({
				url: `schemas/${schemaId}/can_delete_field/`,
				params: { fieldID: fieldId },
			}),
		}),
	}),
});

export const {
	useGetFeatureSchemasQuery,
	useAddFeatureSchemaMutation,
	useUpdateFeatureSchemaMutation,
	usePatchFeatureSchemaMutation,
	useLazyCheckCanDeleteFeatureSchemaQuery,
	useDeleteSchemaMutation,
	useLazyCheckCanDeleteSymbolQuery,
	useLazyCheckCanDeleteFieldQuery,
} = featureSchemasApi;
