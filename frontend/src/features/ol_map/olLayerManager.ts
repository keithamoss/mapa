import omitBy from 'lodash-es/omitBy';
import type Feature from 'ol/Feature';
import type { Coordinate } from 'ol/coordinate';
import type BaseEvent from 'ol/events/Event';
import { getTopLeft, getWidth } from 'ol/extent.js';
import GeoJSON from 'ol/format/GeoJSON';
import type { Geometry, Point } from 'ol/geom';
import { Modify } from 'ol/interaction';
import type Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/WebGLTile';
import 'ol/ol.css';
import { type Projection, get as getProjection, toLonLat } from 'ol/proj';
import VectorSource, { type VectorSourceEvent } from 'ol/source/Vector';
import WMTS from 'ol/source/WMTS.js';
import { Circle, Stroke } from 'ol/style';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import type { BasemapStyle } from '../../app/services/auth';
import type { MapaFeature } from '../../app/services/features';
import type { FeatureSchema, SymbologyProps } from '../../app/services/schemas';
import { mapaThemeSecondaryBlueRGB } from '../../app/ui/theme';
import { determineSymbolForFeature } from './olStylingManager';
import { type WebGLLayerSpriteSheet, buildSpriteSheet } from './olWebGLPointsLayerManager';

export const geoJSONFormat = new GeoJSON({
	dataProjection: 'EPSG:4326',
	featureProjection: 'EPSG:3857',
});

export interface GeoJSONFeatureCollection {
	type: 'FeatureCollection';
	features: {
		id: number;
		type: 'Feature';
		properties: {
			[key: string]: unknown;
		};
		geometry: {
			type: 'Point';
			coordinates: Coordinate;
		};
	}[];
}

export const getWMTSTileLayer = (basemap_style: BasemapStyle) => {
	const projection = getProjection('EPSG:3857');

	const getWMTSTileGrid = (projection: Projection | null) => {
		if (projection === null) {
			return new WMTSTileGrid({ resolutions: [], matrixIds: [] });
		}

		// Generate resolutions and matrixIds arrays
		const projectionExtent = projection.getExtent();
		const size = getWidth(projectionExtent) / 256;

		const resolutions = new Array(23);
		const matrixIds = new Array(23);
		for (let z = 0; z < 23; ++z) {
			resolutions[z] = size / Math.pow(2, z);
			matrixIds[z] = z;
		}

		return new WMTSTileGrid({
			origin: getTopLeft(projectionExtent),
			resolutions,
			matrixIds,
		});
	};

	return new TileLayer({
		preload: Number.POSITIVE_INFINITY,
		source: new WMTS({
			urls: [
				`https://api.mapbox.com/styles/v1/keithmoss/${basemap_style}/tiles/{TileMatrix}/{TileCol}/{TileRow}?access_token=${
					import.meta.env.VITE_MAPBOX_API_KEY
				}`,
			],
			layer: basemap_style,
			matrixSet: 'GoogleMapsCompatible',
			format: 'image/png',
			projection: projection || undefined,
			requestEncoding: 'REST',
			tileGrid: getWMTSTileGrid(projection),
			style: 'default',
			dimensions: {},
			wrapX: false,
		}),
	});
};

export const convertFeaturesToGeoJSON = async (
	features: MapaFeature[],
	defaultMapSymbology: SymbologyProps | null,
	featureSchemas: FeatureSchema[],
): Promise<{
	geoJSON: GeoJSONFeatureCollection;
	spriteSheet: WebGLLayerSpriteSheet;
}> => {
	const symbols: { [key: string]: Partial<SymbologyProps> } = {};

	const geoJSON: GeoJSONFeatureCollection =
		features.length > 0
			? {
					type: 'FeatureCollection',
					features:
						features !== undefined
							? features.map((feature) => {
									const not_allowed = ['geom'];
									const filteredFeature = omitBy(feature, (value, key) => not_allowed.includes(key));

									const symbolProps = determineSymbolForFeature(feature, defaultMapSymbology, featureSchemas);
									symbols[symbolProps.symbolCacheKey] = symbolProps.symbol;

									return {
										id: feature.id,
										type: 'Feature',
										properties: {
											...filteredFeature,
											...symbolProps,
										},
										geometry: {
											type: 'Point',
											coordinates: feature.geom.coordinates,
										},
									};
								})
							: [],
				}
			: {
					type: 'FeatureCollection',
					features: [],
				};

	return {
		geoJSON,
		// This is an async function due to the svg > img translation process.
		// So we use layersReadyForRendering to track when the sheet has
		// finished building and the layer can be re - rendered.
		spriteSheet: await buildSpriteSheet(symbols),
	};
};

export const setupModifyInteraction = (
	vectorLayer: VectorLayer<VectorSource>,
	onModifyInteractionStartEnd: (evt: BaseEvent | Event) => void,
	onModifyInteractionAddRemoveFeature: (evt: VectorSourceEvent) => void,
) => {
	const modify = new Modify({
		hitDetection: vectorLayer,
		source: vectorLayer.getSource() || undefined,
	});

	modify.setProperties({ is_modify: true });

	modify.on(['modifystart', 'modifyend'], onModifyInteractionStartEnd);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	modify.getOverlay().getSource().on(['addfeature', 'removefeature'], onModifyInteractionAddRemoveFeature);

	return modify;
};

export const isDataVectorLayer = (layer: Layer) => layer.getProperties().id === 'data-layer';

export const buildGeoJSONForUserPosition = (latitude: number, longitude: number) => ({
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [longitude, latitude],
			},
		},
	],
});

export const createVectorLayerForUserPosition = (latitude: number, longitude: number) => {
	const format = new GeoJSON({
		dataProjection: 'EPSG:4326',
		featureProjection: 'EPSG:3857',
	});

	return new VectorLayer({
		// renderMode: "image",
		source: new VectorSource({
			format,
			features: format.readFeatures(buildGeoJSONForUserPosition(latitude, longitude)),
		}),
		style: [
			new Style({
				image: new Circle({
					fill: new Fill({ color: `rgba(${mapaThemeSecondaryBlueRGB}, 0.5)` }),
					// stroke: new Stroke({ color: "rgba(${mapaThemeSecondaryBlueRGB}, 1)", width: 0.5 }),
					radius: 20,
				}),
			}),
			new Style({
				image: new Circle({
					fill: new Fill({ color: `rgb(${mapaThemeSecondaryBlueRGB})` }),
					stroke: new Stroke({ color: 'white', width: 1.5 }),
					radius: 10,
				}),
			}),
		],
		properties: {
			id: 'user-position-layer',
		},
	});
};

export const updateVectorLayerForUserPosition = (
	latitude: number,
	longitude: number,
	vectorLayer: VectorLayer<VectorSource<Feature<Geometry>>>,
) => {
	const vectorSource = vectorLayer.getSource();
	if (vectorSource !== null) {
		vectorSource.clear();

		const format = new GeoJSON({
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857',
		});

		const geojson = buildGeoJSONForUserPosition(latitude, longitude);
		vectorSource.addFeatures(format.readFeatures(geojson));
	}
};

export const getPointGeoJSONFromCoordinates = (point: Point) => {
	return {
		type: 'Point',
		coordinates: toLonLat(point.getCoordinates()),
	};
};
