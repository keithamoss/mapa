import { createSelector } from '@reduxjs/toolkit';
import { Point } from 'ol/geom';
import {
	featuresAdapter,
	featuresApi,
	GeomType,
	initialFeaturesState,
	NewMapaFeature,
} from '../../app/services/features';
import { AppDispatch, RootState } from '../../app/store';
import { OLMapView, selectMapView } from '../app/appSlice';
import { selectMapById } from '../maps/mapsSlice';
import { getPointGeoJSONFromCoordinates } from '../ol_map/olLayerManager';
import { getSchemasAvailableForMap } from '../schemas/schemasSlice';

export const selectGetFeaturesResult = featuresApi.endpoints.getFeatures.select();

const selectFeaturesData = createSelector(selectGetFeaturesResult, (featuresResult) => featuresResult.data);

export const { selectAll: selectAllFeatures, selectById: selectFeatureById } = featuresAdapter.getSelectors(
	(state: RootState) => selectFeaturesData(state) ?? initialFeaturesState,
);

export const initFeatureAtMapCentre = (mapId: number) => {
	return (_dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState();
		const map = selectMapById(state, mapId);
		const view = selectMapView(state);

		const getSchemaIdForNewFeature = () => {
			if (map !== undefined) {
				if (map.last_used_schema_id !== null) {
					return map.last_used_schema_id;
				}

				const filteredSchemas = getSchemasAvailableForMap(state, map.id);
				if (filteredSchemas.length === 1) {
					return filteredSchemas[0].id;
				}
			}

			return null;
		};

		return createNewMapaFeatureObject(mapId, getSchemaIdForNewFeature(), view);
	};
};

export const initFeatureAtMapCentreWithKnownSchema = (mapId: number, schemaId: number | null) => {
	return (_dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState();
		const view = selectMapView(state);

		return createNewMapaFeatureObject(mapId, schemaId, view);
	};
};

export const createNewMapaFeatureObject = (
	mapId: number,
	schemaId: number | null,
	view: Partial<OLMapView> | undefined,
): NewMapaFeature | undefined => {
	// This checking of view is important!
	// It prevents the user from creating features while we're still trying to retrieve their location.
	if (view?.center !== undefined) {
		return {
			geom: getPointGeoJSONFromCoordinates(new Point(view.center)),
			geom_type: GeomType.Point,
			map_id: mapId,
			schema_id: schemaId,
			symbol_id: null,
			data: [],
			import_job: '',
		};
	}
};
