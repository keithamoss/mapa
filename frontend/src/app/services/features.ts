import { createEntityAdapter } from "@reduxjs/toolkit";
import { Coordinate } from "ol/coordinate";
import { api } from "./api";

export enum GeomType {
  Point = "Point",
}

export interface Geom {
  type: string;
  coordinates: Coordinate;
}

export interface FeatureDataItemBase {
  schema_field_id: number;
}

export interface FeatureDataItemTextField extends FeatureDataItemBase {
  value: string;
}

export interface FeatureDataItemBooleanField extends FeatureDataItemBase {
  value: boolean;
}

export interface FeatureDataItemSymbologyBooleanField
  extends FeatureDataItemBase {
  value: boolean;
}

export type FeatureDataItem =
  | FeatureDataItemTextField
  | FeatureDataItemBooleanField
  | FeatureDataItemSymbologyBooleanField;

export interface Feature {
  id: number;
  geom: Geom;
  geom_type: GeomType;
  map_id: number;
  schema_id: number | null;
  symbol_id: number | null;
  data: FeatureDataItem[];
}

export type NewFeature = Omit<Feature, "id">;

type FeaturesResponse = Feature[];

export const featuresAdapter = createEntityAdapter<Feature>();

const initialState = featuresAdapter.getInitialState();
export { initialState as initialFeaturesState };

export const featuresApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeaturesForMap: builder.query<{ [key: number]: Feature }, number>({
      query: (map_id) => `maps/${map_id}/features/`,
      transformResponse: (res: FeaturesResponse) => {
        return Object.fromEntries(res.map((feature) => [feature.id, feature]));
      },
      providesTags: (result, error, arg) => [
        { type: "Feature", id: "LIST" },
        ...(result !== undefined
          ? Object.keys(result).map((id) => ({ type: "Feature", id } as const))
          : []),
      ],
    }),
    addFeatureToMap: builder.mutation<Feature, NewFeature>({
      query: (initialFeature) => ({
        url: "features/",
        method: "POST",
        body: initialFeature,
      }),
      invalidatesTags: [{ type: "Feature", id: "LIST" }],
    }),
    updateFeature: builder.mutation<Feature, Partial<Feature>>({
      query: (feature) => ({
        url: `features/${feature.id}/`,
        method: "PUT",
        body: feature,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Feature", id }],
    }),
    deleteFeature: builder.mutation<Feature, number>({
      query: (id) => ({
        url: `features/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Feature", id }],
    }),
  }),
});

export const {
  useGetFeaturesForMapQuery,
  useAddFeatureToMapMutation,
  useUpdateFeatureMutation,
  useDeleteFeatureMutation,
} = featuresApi;
