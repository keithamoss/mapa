import { Map } from 'ol';
import { default as OLFeature } from 'ol/Feature';
import BaseEvent from 'ol/events/Event';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { StyleFunction } from 'ol/style/Style';
import { GeoJSONFeatureCollection, geoJSONFeatures, geoJSONFormat, setupModifyInteraction } from './olLayerManager';
import { olStyleFunction } from './olStylingManager';

export const createVectorImageLayer = (geoJSONFeatures: GeoJSONFeatureCollection) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const styleFunction = (feature: OLFeature, resolution: number) => olStyleFunction(feature);
	return new VectorImageLayer({
		source: new VectorSource({
			format: geoJSONFormat,
			features: geoJSONFormat.readFeatures(geoJSONFeatures),
		}),
		style: styleFunction as StyleFunction,
		imageRatio: window.location.href.includes('imageRatio15') === true ? 1.5 : 1,
		properties: {
			id: 'data-layer',
		},
	});
};

export const manageVectorImageLayerCreation = (
	map: Map,
	isFeatureMovementAllowed: boolean,
	onModifyInteractionStartEnd: (evt: BaseEvent | Event) => void,
	onModifyInteractionAddRemoveFeature: (evt: VectorSourceEvent) => void,
) => {
	const vectorLayer = createVectorImageLayer(geoJSONFeatures.features);
	map.addLayer(vectorLayer);

	const modify = setupModifyInteraction(
		// Not sure why this was complaining
		vectorLayer as VectorLayer<VectorSource<Geometry>>,
		onModifyInteractionStartEnd,
		onModifyInteractionAddRemoveFeature,
	);
	modify.setActive(isFeatureMovementAllowed);
	map.addInteraction(modify);

	return vectorLayer;
};

export const manageVectorImageLayerUpdate = (vectorLayer: VectorImageLayer<VectorSource<Geometry>>) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const styleFunction = (feature: OLFeature, resolution: number) => olStyleFunction(feature);

	const vectorSource = vectorLayer.getSource();
	if (vectorSource !== null) {
		vectorSource.clear(true);
		vectorSource.addFeatures(geoJSONFormat.readFeatures(geoJSONFeatures.features));
	}

	vectorLayer.setStyle(styleFunction as StyleFunction);
};
