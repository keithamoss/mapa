import { sample } from "lodash-es";
import omitBy from "lodash-es/omitBy";
import { Coordinate } from "ol/coordinate";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, Point } from "ol/geom";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import VectorImageLayer from "ol/layer/VectorImage";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import { toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Circle, Stroke } from "ol/style";
import Fill from "ol/style/Fill";
import Style, { StyleFunction } from "ol/style/Style";
import { Feature } from "../../app/services/features";
import { FeatureSchema, SymbologyProps } from "../../app/services/schemas";
import { determineSymbolForFeature } from "./olStylingManager";

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

export const buildGeoJSONFromFeatures = (
  features: Feature[],
  defaultMapSymbology: SymbologyProps | null,
  featureSchemas: FeatureSchema[]
): GeoJSONFeatureCollection => ({
  type: "FeatureCollection",
  features:
    features !== undefined
      ? features.map((feature) => {
          const not_allowed = ["geom"];
          const filteredFeature = omitBy(feature, (value, key) =>
            not_allowed.includes(key)
          );

          return {
            id: feature.id,
            type: "Feature",
            properties: {
              ...filteredFeature,
              ...determineSymbolForFeature(
                feature,
                defaultMapSymbology,
                featureSchemas
              ),
              symbolCacheKeyWebGL: sample([
                "light",
                "sphere",
                "circle",
                "disc",
                "oval",
                "triangle",
                "fireball",
              ]),
            },
            geometry: {
              type: "Point",
              coordinates: feature.geom.coordinates,
            },
          };
        })
      : [],
});

export const createDataVectorLayer = (
  geoJSONFeatures: GeoJSONFeatureCollection,
  styleFunction: StyleFunction
) => {
  const format = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  if (window.location.href.includes("mode=VectorImageLayer") === true) {
    return new VectorImageLayer({
      source: new VectorSource({
        format,
        features: format.readFeatures(geoJSONFeatures),
      }),
      style: styleFunction,
      imageRatio:
        window.location.href.includes("imageRatio15") === true ? 1.5 : 1,
      properties: {
        id: "data-layer",
      },
    });
  } else if (window.location.href.includes("mode=WebGLPointsLayer") === true) {
    return new WebGLPointsLayer({
      source: new VectorSource({
        format,
        features: format.readFeatures(geoJSONFeatures),
      }) as any,
      style: {
        symbol: {
          symbolType: "image",
          // src: "icons/ufo_shapes.png",
          src: "data:image/png;base64,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",
          size: 42,
          rotateWithView: false,
          textureCoord: [
            "match",
            ["get", "symbolCacheKeyWebGL"],
            "light",
            [0, 0, 0.25, 0.5],
            "sphere",
            [0.25, 0, 0.5, 0.5],
            "circle",
            [0.25, 0, 0.5, 0.5],
            "disc",
            [0.5, 0, 0.75, 0.5],
            "oval",
            [0.5, 0, 0.75, 0.5],
            "triangle",
            [0.75, 0, 1, 0.5],
            "fireball",
            [0, 0.5, 0.25, 1],
            [0.75, 0.5, 1, 1],
          ],
        },
      },
      properties: {
        id: "data-layer",
      },
    });
  } else {
    return new VectorLayer({
      source: new VectorSource({
        format,
        features: format.readFeatures(geoJSONFeatures),
      }),
      style: styleFunction,
      properties: {
        id: "data-layer",
      },
    });
  }
};

export const updateDataVectorLayer = (
  geoJSONFeatures: GeoJSONFeatureCollection,
  // @FIXME
  // vectorLayer: WebGLPointsLayer<VectorSource<Geometry>>
  vectorLayer: any
) => {
  const vectorSource = vectorLayer.getSource();
  if (vectorSource !== null) {
    vectorSource.clear();

    const format = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    vectorSource.addFeatures(format.readFeatures(geoJSONFeatures));
  }
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
