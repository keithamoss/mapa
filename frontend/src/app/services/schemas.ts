import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { api } from "./api";

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

export interface FeatureSchemaSymbologyGroup
  extends FeatureSchemaSymbologyGroupModifiableProps {
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
}

export interface NewFeatureSchema extends FeatureSchemaModifiableProps {}

export interface FeatureSchema extends FeatureSchemaModifiableProps {
  id: number;
  owner_id: number;
}

export enum FeatureSchemaFieldType {
  TextField = "text_field",
  BooleanField = "boolean_field",
  SymbologyFieldBoolean = "symbology_field_boolean",
}

export type FeatureSchemaFieldDefinitionTextFieldFormModifiableProps = {
  name: string;
  default_value: string;
};

export type FeatureSchemaFieldDefinitionTextField =
  FeatureSchemaFieldDefinitionTextFieldFormModifiableProps & {
    type: FeatureSchemaFieldType.TextField;
    id: number;
  };

export type FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps = {
  name: string;
  default_value: boolean;
};

export type FeatureSchemaFieldDefinitionBooleanField =
  FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps & {
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
  | FeatureSchemaFieldDefinitionBooleanFieldFormModifiableProps
  | FeatureSchemaFieldDefinitionSymbologyBooleanFormModifiableProps;

export type FeatureSchemaFieldDefinitionCollection =
  | FeatureSchemaFieldDefinitionTextField
  | FeatureSchemaFieldDefinitionBooleanField
  | FeatureSchemaFieldDefinitionSymbologyBoolean;

export type NewFeatureSchemaFieldDefinitionCollection = Omit<
  FeatureSchemaFieldDefinitionCollection,
  "id"
>;
type FeatureSchemasResponse = FeatureSchema[];
export const featureSchemasAdapter = createEntityAdapter<FeatureSchema>();

const initialState = featureSchemasAdapter.getInitialState();
export { initialState as initialFeatureSchemasState };

export const featureSchemasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureSchemas: builder.query<EntityState<FeatureSchema>, void>({
      query: () => "schemas/",
      transformResponse: (res: FeatureSchemasResponse) => {
        return featureSchemasAdapter.setAll(initialState, res);
      },
      providesTags: (result, error, arg) => [
        { type: "FeatureSchema", id: "LIST" },
        ...(result !== undefined
          ? result.ids.map((id) => ({ type: "FeatureSchema" as const, id }))
          : []),
      ],
    }),
    addFeatureSchema: builder.mutation<FeatureSchema, Partial<FeatureSchema>>({
      query: (initialFeatureSchema) => ({
        url: "schemas/",
        method: "POST",
        body: initialFeatureSchema,
      }),
      invalidatesTags: [{ type: "FeatureSchema", id: "LIST" }],
    }),
    updateFeatureSchema: builder.mutation<
      FeatureSchema,
      Partial<FeatureSchema>
    >({
      query: (featureSchema) => ({
        url: `schemas/${featureSchema.id}/`,
        method: "PUT",
        body: featureSchema,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FeatureSchema", id },
      ],
    }),
  }),
});

export const {
  useGetFeatureSchemasQuery,
  useAddFeatureSchemaMutation,
  useUpdateFeatureSchemaMutation,
} = featureSchemasApi;
