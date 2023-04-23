import { Point } from "ol/geom";
import { featuresApi, GeomType } from "../../app/services/features";
import { AppDispatch, RootState } from "../../app/store";
import { selectMapView } from "../app/appSlice";
import { selectMapById } from "../maps/mapsSlice";
import { getPointGeoJSONFromCoordinates } from "../ol_map/olLayerManager";
import { getSchemasAvailableForMap } from "../schemas/schemasSlice";

export const initFeatureFromMapCentre = (mapId: number) => {
  return (_dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const view = selectMapView(state);
    const map = selectMapById(state, mapId);

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

    if (map !== undefined && view?.center !== undefined) {
      return {
        geom: getPointGeoJSONFromCoordinates(new Point(view.center)),
        geom_type: GeomType.Point,
        map_id: mapId,
        schema_id: getSchemaIdForNewFeature(),
        symbol_id: null,
        data: [],
      };
    }
  };
};

export const selectFeatureById = (mapId: number, featureId: number) => {
  const { feature } = featuresApi.useGetFeaturesForMapQuery(mapId, {
    selectFromResult: ({ data }) => ({
      feature: data !== undefined ? data[featureId] : undefined,
    }),
  });
  return feature;
};
