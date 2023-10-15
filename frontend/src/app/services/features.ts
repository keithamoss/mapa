import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { Coordinate } from 'ol/coordinate';
import { prepareFeaturesForMap } from '../../features/app/appSlice';
import { api } from './api';
import { SymbologyProps } from './schemas';

export enum GeomType {
	Point = 'Point',
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

export interface FeatureDataItemNumberField extends FeatureDataItemBase {
	value: number;
}

export interface FeatureDataItemBooleanField extends FeatureDataItemBase {
	value: boolean;
}

export interface FeatureDataItemSymbologyBooleanField extends FeatureDataItemBase {
	value: boolean;
}

export interface FeatureDataItemDateField extends FeatureDataItemBase {
	value: string;
}

export type FeatureDataItem =
	| FeatureDataItemTextField
	| FeatureDataItemNumberField
	| FeatureDataItemBooleanField
	| FeatureDataItemSymbologyBooleanField
	| FeatureDataItemDateField;

export interface Feature {
	id: number;
	geom: Geom;
	geom_type: GeomType;
	map_id: number;
	schema_id: number | null;
	symbol_id: number | null;
	data: FeatureDataItem[];
	// These three are inserted by buildGeoJSONFromFeatures()
	symbolCacheKey?: string;
	symbol?: Partial<SymbologyProps>;
	// symbolCacheKeyWebGL?: string;
	import_job: string;
}

export type NewFeature = Omit<Feature, 'id'>;

type FeaturesResponse = Feature[];

export const featuresAdapter = createEntityAdapter<Feature>();

const initialState = featuresAdapter.getInitialState();
export { initialState as initialFeaturesState };

export const featuresApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getFeatures: builder.query<EntityState<Feature>, void>({
			query: () => `maps/features/`,
			transformResponse: (res: FeaturesResponse) => {
				return featuresAdapter.setAll(initialState, res);
			},
			providesTags: (result) => [
				{ type: 'Feature', id: 'LIST' },
				...(result !== undefined ? result.ids.map((id) => ({ type: 'Feature' as const, id })) : []),
			],
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				await queryFulfilled;
				dispatch(prepareFeaturesForMap());
			},
		}),
		addFeatureToMap: builder.mutation<Feature, NewFeature>({
			query: (initialFeature) => ({
				url: 'features/',
				method: 'POST',
				body: initialFeature,
			}),
			invalidatesTags: [{ type: 'Feature', id: 'LIST' }],
		}),
		updateFeature: builder.mutation<Feature, Partial<Feature>>({
			query: (feature) => ({
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				url: `features/${feature.id}/`,
				method: 'PUT',
				body: feature,
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'Feature', id }],
		}),
		deleteFeature: builder.mutation<Feature, number>({
			query: (id) => ({
				url: `features/${id}/`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, id) => [{ type: 'Feature', id }],
		}),
	}),
});

export const { useGetFeaturesQuery, useAddFeatureToMapMutation, useUpdateFeatureMutation, useDeleteFeatureMutation } =
	featuresApi;
