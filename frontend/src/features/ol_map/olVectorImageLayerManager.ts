import type { Map } from 'ol';
import type Feature from 'ol/Feature';
import type BaseEvent from 'ol/events/Event';
import type { Geometry } from 'ol/geom';
import type VectorLayer from 'ol/layer/Vector';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource, { type VectorSourceEvent } from 'ol/source/Vector';
import type { StyleFunction } from 'ol/style/Style';
import { type GeoJSONFeatureCollection, geoJSONFormat, setupModifyInteraction } from './olLayerManager';
import { olStyleFunction } from './olStylingManager';

export const createVectorImageLayer = (features: GeoJSONFeatureCollection) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const styleFunction = (feature: Feature, resolution: number) => olStyleFunction(feature);
	return new VectorImageLayer({
		source: new VectorSource({
			format: geoJSONFormat,
			features: geoJSONFormat.readFeatures(features),
			attributions: [
				'© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
			],
		}),
		style: styleFunction as StyleFunction,
		imageRatio: window.location.href.includes('imageRatio15') === true ? 1.5 : 1,
		properties: {
			id: 'data-layer',
		},
	});
};

export const manageVectorImageLayerCreation = (
	features: GeoJSONFeatureCollection,
	map: Map,
	isFeatureMovementAllowed: boolean,
	onModifyInteractionStartEnd: (evt: BaseEvent | Event) => void,
	onModifyInteractionAddRemoveFeature: (evt: VectorSourceEvent) => void,
) => {
	const vectorLayer = createVectorImageLayer(features);
	map.addLayer(vectorLayer);

	const modify = setupModifyInteraction(
		// Not sure why this was complaining
		vectorLayer as unknown as VectorLayer<VectorSource<Feature<Geometry>>>,
		onModifyInteractionStartEnd,
		onModifyInteractionAddRemoveFeature,
	);
	modify.setActive(isFeatureMovementAllowed);
	map.addInteraction(modify);

	return vectorLayer;
};

export const manageVectorImageLayerUpdate = (
	features: GeoJSONFeatureCollection,
	vectorLayer: VectorImageLayer<VectorSource<Feature<Geometry>>>,
) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const styleFunction = (feature: Feature, resolution: number) => olStyleFunction(feature);

	const vectorSource = vectorLayer.getSource();
	if (vectorSource !== null) {
		vectorSource.clear(true);
		vectorSource.addFeatures(geoJSONFormat.readFeatures(features));
	}

	vectorLayer.setStyle(styleFunction as StyleFunction);
};
