import omitBy from "lodash-es/omitBy";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, Point } from "ol/geom";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import { toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Circle, Stroke } from "ol/style";
import Fill from "ol/style/Fill";
import Style, { StyleFunction } from "ol/style/Style";
import { Feature } from "../../app/services/features";

// export const getPointWKTGeomFromCoordinates = (geometry: Geometry) =>
//   `SRID=4326;${new WKT().writeGeometry(geometry, {
//     dataProjection: "EPSG:4326",
//     featureProjection: "EPSG:3857",
//   })}`;

export const getPointGeoJSONFromCoordinates = (point: Point) => {
  return {
    type: "Point",
    coordinates: toLonLat(point.getCoordinates()),
  };
};

export const buildGeoJSONFromFeatures = (features: Feature[]) => ({
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
            properties: filteredFeature,
            geometry: {
              type: "Point",
              coordinates: feature.geom.coordinates,
            },
          };
        })
      : [],
});

export const createDataVectorLayer = (
  features: Feature[],
  styleFunction: StyleFunction
) => {
  const format = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  return new VectorLayer({
    // renderMode: "image",
    source: new VectorSource({
      format,
      features: format.readFeatures(buildGeoJSONFromFeatures(features)),
    }),
    style: styleFunction,
    properties: {
      id: "data-layer",
    },
  });
};

export const updateDataVectorLayer = (
  features: Feature[],
  vectorLayer: VectorLayer<VectorSource<Geometry>>
) => {
  const vectorSource = vectorLayer.getSource();
  if (vectorSource !== null) {
    vectorSource.clear();

    const format = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    const geojson = buildGeoJSONFromFeatures(features);
    vectorSource.addFeatures(format.readFeatures(geojson));
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
