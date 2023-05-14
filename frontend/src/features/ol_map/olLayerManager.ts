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
import { getFontAwesomeIconForSymbolAsSVGString } from "../symbology/symbologyHelpers";
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

const geoJSONFormat = new GeoJSON({
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
});

export let geoJSONFeatures: { features: GeoJSONFeatureCollection } = {
  features: {
    type: "FeatureCollection",
    features: [],
  },
};

export let webGLLayerStyle: any = {};

export const buildGeoJSONFromFeatures = (
  features: Feature[],
  defaultMapSymbology: SymbologyProps | null,
  featureSchemas: FeatureSchema[],
  setLayersReadyForRendering: React.Dispatch<
    React.SetStateAction<{
      [key: number]: boolean;
    }>
  >,
  layerVersion: number
): GeoJSONFeatureCollection => {
  if (features.length === 0) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const symbols: any = {};
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
  buildSpriteSheet(symbols, layerVersion, setLayersReadyForRendering);

  return geoJSON;
};

const loadImage = (url: string, symbolCacheKey: string) => {
  const img = new Image();
  img.src = url;
  return new Promise((resolve, reject) => {
    img.onload = () => resolve([img, symbolCacheKey]);
    img.onerror = reject;
  });
};

const canvas = document.createElement("canvas");
// canvas.className = "webGLPointsSpriteSheet";
canvas.width = 0;
canvas.height = 0;
const context = canvas.getContext("2d");

const buildSpriteSheet = async (
  symbols: any,
  layerVersion: number,
  setLayersReadyForRendering: any
) => {
  if (context === null) {
    // This should never happen, but it makes the linter happy.
    return;
  }

  // Before we can start using the canvas, clear everything already drawn on there
  context.clearRect(0, 0, canvas.width, canvas.height);

  const imgPromises: any = [];

  Object.keys(symbols).forEach((symbolCacheKey) => {
    const symbol = symbols[symbolCacheKey];

    const icon = getFontAwesomeIconForSymbolAsSVGString(symbol, {
      // Retaina goodness
      size: symbol.size * 2,
    });

    if (icon !== null) {
      imgPromises.push(
        loadImage(
          `data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8"?>${icon}`,
          symbolCacheKey
        )
      );
    }
  });

  const loadedSVGImages = await Promise.all(imgPromises);

  let localSpriteSheet: any = ["match", ["get", "symbolCacheKey"]];

  const padding = 10;

  let canvasWidth = 0,
    canvasHeight = padding;

  const imgs: any = [];

  loadedSVGImages.forEach(([img, symbolCacheKey]: any) => {
    canvasWidth = Math.max(canvasWidth, img.width + padding + padding);
    canvasHeight = canvasHeight + padding + img.height;

    imgs.push([img, symbolCacheKey]);
  });

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // canvas.style.zIndex = "20000";
  // canvas.style.position = "absolute";
  // canvas.style.bottom = "0";
  // context.fillStyle = "black";
  // context.fillRect(0, 0, canvas.width, canvas.height);
  // document.body.appendChild(canvas);

  const localSpriteSheetSize = ["match", ["get", "symbolCacheKey"], "fake", 42];

  let nextCanvasPositionY = padding;

  imgs.forEach(([img, symbolCacheKey]: any) => {
    context.drawImage(
      img,
      0, // X,Y coordination positions to start extracting image data from 'img'
      0,
      img.width,
      img.height,
      padding, // X,Y coordination positions to place the top left corner of the image data on the canvas
      nextCanvasPositionY,
      img.width,
      img.height
    );

    localSpriteSheet.push(symbolCacheKey);

    const topLeftX = padding;
    const topLeftY = nextCanvasPositionY;

    // tlx, tly, brx, bry
    localSpriteSheet.push([
      topLeftX / canvas.width,
      topLeftY / canvas.height,
      (topLeftX + img.width) / canvas.width,
      (topLeftY + img.height) / canvas.height,
    ]);

    localSpriteSheetSize.push(symbolCacheKey);
    localSpriteSheetSize.push(img.width / 2);

    nextCanvasPositionY += img.height + padding;
  });

  // @TODO Add fallback icon
  localSpriteSheet.push([0, 0, 1, 1]);
  localSpriteSheetSize.push(120);

  webGLLayerStyle = {
    base64: canvas.toDataURL("image/png"),
    textureCoord: localSpriteSheet,
    size: localSpriteSheetSize,
  };

  setLayersReadyForRendering((prevState: any) => ({
    ...prevState,
    [layerVersion]: true,
  }));
};

export const getNextLayerVersion = (layerVersions: number[]) => {
  if (layerVersions.length === 0) {
    return 1;
  }
  return Math.max(...layerVersions) + 1;
};

export const createDataVectorLayer = (
  geoJSONFeatures: GeoJSONFeatureCollection,
  styleFunction: StyleFunction
) => {
  if (window.location.href.includes("mode=VectorImageLayer") === true) {
    return new VectorImageLayer({
      source: new VectorSource({
        format: geoJSONFormat,
        features: geoJSONFormat.readFeatures(geoJSONFeatures),
      }),
      style: styleFunction,
      imageRatio:
        window.location.href.includes("imageRatio15") === true ? 1.5 : 1,
      properties: {
        id: "data-layer",
      },
    });
  } else if (window.location.href.includes("mode=VectorLayer") === true) {
    return new VectorLayer({
      source: new VectorSource({
        format: geoJSONFormat,
        features: geoJSONFormat.readFeatures(geoJSONFeatures),
      }),
      style: styleFunction,
      properties: {
        id: "data-layer",
      },
    });
  } else {
    console.log("Create WebGLPointsLayer");

    return new WebGLPointsLayer({
      source: new VectorSource({
        format: geoJSONFormat,
        features: geoJSONFormat.readFeatures(geoJSONFeatures),
      }) as any,
      style: {
        symbol: {
          symbolType: "image",
          rotateWithView: false,
          src: webGLLayerStyle["base64"],
          size: webGLLayerStyle["size"],
          textureCoord: webGLLayerStyle["textureCoord"],
        },
      },
      properties: {
        id: "data-layer",
      },
    });
  }
};

export const updateDataVectorLayer = async (
  geoJSONFeatures: GeoJSONFeatureCollection,
  vectorSource: VectorSource<Geometry> | null
) => {
  if (vectorSource !== null) {
    vectorSource.clear(true);
    vectorSource.addFeatures(geoJSONFormat.readFeatures(geoJSONFeatures));
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
