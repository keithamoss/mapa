import omitBy from "lodash-es/omitBy";
import { Coordinate } from "ol/coordinate";
import BaseEvent from "ol/events/Event";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, Point } from "ol/geom";
import { Modify } from "ol/interaction";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import { toLonLat } from "ol/proj";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { Circle, Stroke } from "ol/style";
import Fill from "ol/style/Fill";
import Style from "ol/style/Style";
import { MapRenderer } from "../../app/services/auth";
import { Feature } from "../../app/services/features";
import { FeatureSchema, SymbologyProps } from "../../app/services/schemas";
import { determineSymbolForFeature } from "./olStylingManager";
import { buildSpriteSheet } from "./olWebGLPointsLayerManager";

export const geoJSONFormat = new GeoJSON({
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
});

export let geoJSONFeatures: { features: GeoJSONFeatureCollection } = {
  features: {
    type: "FeatureCollection",
    features: [],
  },
};

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: {
    id: number;
    type: "Feature";
    properties: {
      [key: string]: unknown;
    };
    geometry: {
      type: "Point";
      coordinates: Coordinate;
    };
  }[];
}

export const convertFeaturesToGeoJSON = (
  features: Feature[],
  defaultMapSymbology: SymbologyProps | null,
  featureSchemas: FeatureSchema[],
  setLayersReadyForRendering: React.Dispatch<
    React.SetStateAction<{
      [key: number]: boolean;
    }>
  >,
  layerVersion: number,
  mapRenderer?: MapRenderer
): GeoJSONFeatureCollection => {
  if (features.length === 0) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const symbols: { [key: string]: Partial<SymbologyProps> } = {};

  const geoJSON: GeoJSONFeatureCollection = {
    type: "FeatureCollection",
    features:
      features !== undefined
        ? features.map((feature) => {
            const not_allowed = ["geom"];
            const filteredFeature = omitBy(feature, (value, key) =>
              not_allowed.includes(key)
            );

            const symbolProps = determineSymbolForFeature(
              feature,
              defaultMapSymbology,
              featureSchemas
            );
            symbols[symbolProps.symbolCacheKey] = symbolProps.symbol;

            return {
              id: feature.id,
              type: "Feature",
              properties: {
                ...filteredFeature,
                ...symbolProps,
              },
              geometry: {
                type: "Point",
                coordinates: feature.geom.coordinates,
              },
            };
          })
        : [],
  };

  // This is an async function due to the svg > img translation process.
  // So we use layersReadyForRendering to track when the sheet has
  // finished building and the layer can be re - rendered.
  if (
    mapRenderer === MapRenderer.WebGLPointsLayer ||
    mapRenderer === undefined
  ) {
    buildSpriteSheet(symbols, layerVersion, setLayersReadyForRendering);
  }

  return geoJSON;
};

export const setupModifyInteraction = (
  vectorLayer: VectorLayer<VectorSource>,
  onModifyInteractionStartEnd: (evt: BaseEvent | Event) => void,
  onModifyInteractionAddRemoveFeature: (evt: VectorSourceEvent) => void
) => {
  const modify = new Modify({
    hitDetection: vectorLayer,
    source: vectorLayer.getSource() || undefined,
  });

  modify.on(["modifystart", "modifyend"], onModifyInteractionStartEnd);

  modify
    .getOverlay()
    .getSource()
    .on(["addfeature", "removefeature"], onModifyInteractionAddRemoveFeature);

  return modify;
};

export const isDataVectorLayer = (layer: Layer) =>
  layer.getProperties()["id"] === "data-layer";

export const buildGeoJSONForUserPosition = (
  latitude: number,
  longitude: number
) => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    },
  ],
});

export const createVectorLayerForUserPosition = (
  latitude: number,
  longitude: number
) => {
  const format = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  return new VectorLayer({
    // renderMode: "image",
    source: new VectorSource({
      format,
      features: format.readFeatures(
        buildGeoJSONForUserPosition(latitude, longitude)
      ),
    }),
    style: [
      new Style({
        image: new Circle({
          fill: new Fill({ color: "rgba(67, 133, 244, 0.5)" }),
          // stroke: new Stroke({ color: "rgba(67, 133, 244, 1)", width: 0.5 }),
          radius: 20,
        }),
      }),
      new Style({
        image: new Circle({
          fill: new Fill({ color: "rgb(67, 133, 244)" }),
          stroke: new Stroke({ color: "white", width: 1.5 }),
          radius: 10,
        }),
      }),
    ],
    properties: {
      id: "user-position-layer",
    },
  });
};

export const updateVectorLayerForUserPosition = (
  latitude: number,
  longitude: number,
  vectorLayer: VectorLayer<VectorSource<Geometry>>
) => {
  const vectorSource = vectorLayer.getSource();
  if (vectorSource !== null) {
    vectorSource.clear();

    const format = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    const geojson = buildGeoJSONForUserPosition(latitude, longitude);
    vectorSource.addFeatures(format.readFeatures(geojson));
  }
};

export const getPointGeoJSONFromCoordinates = (point: Point) => {
  return {
    type: "Point",
    coordinates: toLonLat(point.getCoordinates()),
  };
};
