import { MapBrowserEvent, Overlay } from 'ol';
import { MapboxVectorLayer } from 'ol-mapbox-style';
import Geolocation from 'ol/Geolocation';
import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import { Coordinate } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';
import { Point } from 'ol/geom';
import { ModifyEvent } from 'ol/interaction/Modify';
import { fromLonLat } from 'ol/proj';
import { VectorSourceEvent } from 'ol/source/Vector';
import { Basemap } from '../../app/services/auth';
import { Feature } from '../../app/services/features';
import { getPointGeoJSONFromCoordinates, getWMTSTileLayer, isDataVectorLayer } from './olLayerManager';

export const defaultZoomLevel = 18;
export const defaultMapStartingPoint = [115.860444, -31.955978];
export const mapTargetElementId = 'map';
export const geolocationMarkerOvelayerIdOuter = 'geolocation_marker_outer';
export const geolocationMarkerOvelayerIdInner = 'geolocation_marker_inner';

export const getBasemap = (basemap: Basemap | undefined) =>
	basemap === Basemap.MapboxWMTS
		? getWMTSTileLayer()
		: new MapboxVectorLayer({
				styleUrl: 'mapbox://styles/keithmoss/clgu2ornp001j01r76h3o6j3g',
				accessToken: import.meta.env.VITE_MAPBOX_API_KEY,
				preload: Infinity,
		  });

export const createGeolocationMarkerOverlay = (markerElementOverlayId: string) => {
	const markerEl = document.createElement('img');
	markerEl.setAttribute('id', markerElementOverlayId);

	return new Overlay({
		id: markerElementOverlayId,
		positioning: 'center-center',
		element: markerEl,
		stopEvent: false,
	});
};

export const updateMapWithGPSPosition = (map: Map, position: Coordinate | undefined, centreOnMarker: boolean) => {
	if (position !== undefined) {
		const markerOverlayOuter = map.getOverlayById(geolocationMarkerOvelayerIdOuter);
		markerOverlayOuter.setPosition(fromLonLat(position));

		const markerOverlayInner = map.getOverlayById(geolocationMarkerOvelayerIdInner);
		markerOverlayInner.setPosition(fromLonLat(position));

		if (centreOnMarker === true) {
			const view = map.getView();
			view.setCenter(fromLonLat(position));
			view.setZoom(defaultZoomLevel);
			map.setView(view);
		}
	}
};

export const onGeolocationChangePosition =
	(
		map: Map,
		geolocationHasPositionRef: React.MutableRefObject<boolean>,
		setMapHasPosition: React.Dispatch<React.SetStateAction<boolean>>,
		isFollowingGPSRef: React.MutableRefObject<boolean>,
	) =>
	(evt: BaseEvent) => {
		updateMapWithGPSPosition(map, (evt.target as Geolocation).getPosition(), isFollowingGPSRef.current);

		if (geolocationHasPositionRef.current === false) {
			setMapHasPosition(true);
		}
	};

export const onGeolocationError =
	(
		map: Map,
		geolocationHasPositionRef: React.MutableRefObject<boolean>,
		setMapHasPosition: React.Dispatch<React.SetStateAction<boolean>>,
		setIsFollowingGPS: React.Dispatch<React.SetStateAction<boolean>>,
	) =>
	(/*evt: GeolocationError*/) => {
		if (geolocationHasPositionRef.current === false) {
			const view = map.getView();
			view.setCenter(fromLonLat(defaultMapStartingPoint));
			view.setZoom(defaultZoomLevel);
			map.setView(view);

			setMapHasPosition(true);
		}

		setIsFollowingGPS(false);
	};

export const onMapClick = (callback: (features: Feature[]) => void) => (evt: MapBrowserEvent<UIEvent>) => {
	const features: Feature[] = [];

	evt.map.forEachFeatureAtPixel(
		evt.pixel,
		(feature) => {
			features.push(feature.getProperties() as Feature);
		},
		{
			layerFilter: (layer) => isDataVectorLayer(layer),
			hitTolerance: 5,
		},
	);

	callback(features);
};

export const setModifyInteractionStatus = (map: Map | undefined, status: boolean) => {
	if (map !== undefined) {
		map.getInteractions().forEach((interaction) => {
			if (interaction.getProperties().is_modify === true) {
				interaction.setActive(status);
			}
		});
	}
};

export const onModifyInteractionStartEnd =
	(callback: (feature: Partial<Feature>) => void) => (evt: BaseEvent | Event) => {
		const target = document.getElementById(mapTargetElementId);

		if (target !== null) {
			const e = evt as ModifyEvent;
			target.style.cursor = e.type === 'modifystart' ? 'grabbing' : 'pointer';

			if (e.type === 'modifyend') {
				e.features.forEach((feature) => {
					const point = feature.getGeometry() as Point;

					if (point.getType() === 'Point') {
						const { id, geom_type, map_id } = feature.getProperties() as Feature;
						callback({
							id,
							geom: getPointGeoJSONFromCoordinates(point),
							geom_type,
							map_id,
						});
					}
				});
			}
		}
	};

export const onModifyInteractionAddRemoveFeature = (evt: VectorSourceEvent) => {
	const target = document.getElementById(mapTargetElementId);
	if (target !== null) {
		target.style.cursor = evt.type === 'addfeature' ? 'pointer' : '';
	}
};
