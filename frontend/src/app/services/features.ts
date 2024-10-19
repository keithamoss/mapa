import { type EntityState, createEntityAdapter } from '@reduxjs/toolkit';
import type { Coordinate } from 'ol/coordinate';
import type { Point } from 'ol/geom';
import { prepareFeaturesForMap } from '../../features/app/appSlice';
import { api } from './api';
import type { SymbologyProps } from './schemas';

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

export interface FeatureDataItemURLField extends FeatureDataItemBase {
	value: FeatureDataItemURLFieldLinkItem[];
}

export type FeatureDataItemURLFieldLinkItemFormModifiableProps = {
	name: string;
	url: string;
};

export type FeatureDataItemURLFieldLinkItem = FeatureDataItemURLFieldLinkItemFormModifiableProps & {
	id: string; // uuid
};

export type FeatureDataItem =
	| FeatureDataItemTextField
	| FeatureDataItemNumberField
	| FeatureDataItemBooleanField
	| FeatureDataItemSymbologyBooleanField
	| FeatureDataItemDateField
	| FeatureDataItemURLField;

export interface MapaFeature {
	id: number;
	geom: Geom;
	geom_type: GeomType;
	map_id: number;
	schema_id: number | null;
	symbol_id: number | null;
	creation_date: number;
	data: FeatureDataItem[];
	// These two are inserted by buildGeoJSONFromFeatures()
	symbolCacheKey?: string;
	symbol?: Partial<SymbologyProps>;
}

// convertFeaturesToGeoJSON() omits the `geom` property because OpenLayers needs `geometry`
// OpenLayers makes `geometry` into an OpenLayers Geom Point object
export interface MapaOpenLayersFeature extends Omit<MapaFeature, 'geom'> {
	geometry: Point;
}

export type NewMapaFeature = Omit<MapaFeature, 'id' | 'creation_date'>;

type FeaturesResponse = MapaFeature[];

export const featuresAdapter = createEntityAdapter<MapaFeature>();

const initialState = featuresAdapter.getInitialState();
export { initialState as initialFeaturesState };

// IMPORTANT NOTE:
// Features uses Redux Toolkit's pessimistic updates pattern (and doesn't use tags at all) as a performance boost for users on poor quality mobile connections.
// The API responses for adding/updating/deleting features already contain the data we need to amend in the Redux store.
// This let's us avoid having to refetch potentially thousands of features each time when only one has been modified.
export const featuresApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getFeatures: builder.query<EntityState<MapaFeature, number>, void>({
			query: () => `maps/features/`,
			transformResponse: (res: FeaturesResponse) => {
				return featuresAdapter.setAll(initialState, res);
			},
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				await queryFulfilled;
				dispatch(prepareFeaturesForMap());
			},
		}),
		addFeatureToMap: builder.mutation<MapaFeature, NewMapaFeature>({
			query: (initialFeature) => ({
				url: 'features/',
				method: 'POST',
				body: initialFeature,
			}),
			async onQueryStarted(feature, { dispatch, queryFulfilled }) {
				try {
					const { data: addedFeature } = await queryFulfilled;

					dispatch(
						featuresApi.util.updateQueryData('getFeatures', undefined, (draft) => {
							featuresAdapter.addOne(draft, addedFeature);
						}),
					);

					// Note: This means prepareFeaturesForMap() gets called twice in some scenarios.
					// e.g. Here as well as as a result of the getFeatureSchemas() that results from our patchSchema() in FeatureCreator.
					// But it's important to be sure we run this whenever a feature changes, so we'll wear the small hit.
					dispatch(prepareFeaturesForMap());
				} catch {
					// Maybe we need to imporove error handling here?
					// https://github.com/reduxjs/redux-toolkit/issues/2064
					// I presume these are all logged to Sentry at the moment...
				}
			},
		}),
		updateFeature: builder.mutation<MapaFeature, Partial<MapaFeature>>({
			query: (feature) => ({
				url: `features/${feature.id}/`,
				method: 'PUT',
				body: feature,
			}),
			async onQueryStarted(feature, { dispatch, queryFulfilled }) {
				try {
					const { data: updatedFeature } = await queryFulfilled;

					dispatch(
						featuresApi.util.updateQueryData('getFeatures', undefined, (draft) => {
							featuresAdapter.updateOne(draft, { id: updatedFeature.id, changes: updatedFeature });
						}),
					);

					// Note: This means prepareFeaturesForMap() gets called twice in some scenarios.
					// e.g. Here as well as as a result of the getMaps() that results from our patchMap() in FeatureForm.
					// But it's important to be sure we run this whenever a feature changes, so we'll wear the small hit.
					dispatch(prepareFeaturesForMap());
				} catch {
					// Maybe we need to imporove error handling here?
					// https://github.com/reduxjs/redux-toolkit/issues/2064
					// I presume these are all logged to Sentry at the moment...
				}
			},
		}),
		updateFeaturePositionForOLModifyInteraction: builder.mutation<MapaFeature, Pick<MapaFeature, 'id' | 'geom'>>({
			query: (feature) => ({
				url: `features/${feature.id}/`,
				method: 'PATCH',
				body: { geom: feature.geom },
			}),
			async onQueryStarted(feature, { dispatch, queryFulfilled }) {
				try {
					const { data: updatedFeature } = await queryFulfilled;

					dispatch(
						featuresApi.util.updateQueryData('getFeatures', undefined, (draft) => {
							featuresAdapter.updateOne(draft, { id: updatedFeature.id, changes: updatedFeature });
						}),
					);

					// In this very particular instance there's no need to prepareFeaturesForMap() to update the map because that's already happened via the Modify Interaction on the map.
				} catch {
					// Maybe we need to imporove error handling here?
					// https://github.com/reduxjs/redux-toolkit/issues/2064
					// I presume these are all logged to Sentry at the moment...
				}
			},
		}),
		deleteFeature: builder.mutation<void, number>({
			query: (id) => ({
				url: `features/${id}/`,
				method: 'DELETE',
			}),
			async onQueryStarted(featureId, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled;

					dispatch(
						featuresApi.util.updateQueryData('getFeatures', undefined, (draft) => {
							featuresAdapter.removeOne(draft, featureId);
						}),
					);

					dispatch(prepareFeaturesForMap());
				} catch {
					// Maybe we need to imporove error handling here?
					// https://github.com/reduxjs/redux-toolkit/issues/2064
					// I presume these are all logged to Sentry at the moment...
				}
			},
		}),
	}),
});

export const {
	useGetFeaturesQuery,
	useAddFeatureToMapMutation,
	useUpdateFeatureMutation,
	useUpdateFeaturePositionForOLModifyInteractionMutation,
	useDeleteFeatureMutation,
} = featuresApi;
