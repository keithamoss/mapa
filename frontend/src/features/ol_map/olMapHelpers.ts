import { MapBrowserEvent, Overlay } from 'ol';
import { MapboxVectorLayer } from 'ol-mapbox-style';
import Geolocation, { GeolocationError } from 'ol/Geolocation';
import Map from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';
import { Point } from 'ol/geom';
import { ModifyEvent } from 'ol/interaction/Modify';
import { fromLonLat } from 'ol/proj';
import { VectorSourceEvent } from 'ol/source/Vector';
import { Basemap, BasemapStyle } from '../../app/services/auth';
import { MapaFeature, MapaOpenLayersFeature } from '../../app/services/features';
import { getPointGeoJSONFromCoordinates, getWMTSTileLayer, isDataVectorLayer } from './olLayerManager';

export const defaultZoomLevel = 20;
export const defaultMapStartingPoint = [115.860444, -31.955978];
export const mapTargetElementId = 'map';
export const geolocationMarkerOverlayId = 'geolocation_marker';
export const geolocationMarkerHeadingForegroundTriangleOverlayId = 'geolocation_marker_heading_foreground_triangle';
export const geolocationMarkerHeadingBackgroundTriangleOverlayId = 'geolocation_marker_heading_background_triangle';

export const getBasemap = (basemap: Basemap, basemap_style: BasemapStyle) =>
	basemap === Basemap.MapboxWMTS || basemap_style === BasemapStyle.Satellite
		? getWMTSTileLayer(basemap_style)
		: new MapboxVectorLayer({
				styleUrl: `mapbox://styles/keithmoss/${basemap_style}`,
				accessToken: import.meta.env.VITE_MAPBOX_API_KEY,
				preload: Infinity,
			});

export const createGeolocationMarkerOverlay = (markerElementOverlayId: string) => {
	const markerEl = document.createElement('div');
	markerEl.setAttribute('id', markerElementOverlayId);

	const markerElContainer = document.createElement('div');
	markerElContainer.setAttribute('id', `container_${markerElementOverlayId}`);
	markerElContainer.append(markerEl);

	return new Overlay({
		id: markerElementOverlayId,
		positioning: 'center-center',
		element: markerElContainer,
		stopEvent: false,
	});
};

export const getMapOverlayElementAsDiv = (elementId: string) => {
	const geolocationMarkerHeadingForegroundTriangleOverlay = document.getElementById(elementId);

	return geolocationMarkerHeadingForegroundTriangleOverlay !== null
		? (geolocationMarkerHeadingForegroundTriangleOverlay as HTMLDivElement)
		: undefined;
};

export const showCompassHeadingMarker = () => {
	const markerOverlayHeadingForegroundTriangle = document.getElementById(
		geolocationMarkerHeadingForegroundTriangleOverlayId,
	);
	if (markerOverlayHeadingForegroundTriangle !== null) {
		markerOverlayHeadingForegroundTriangle.style.setProperty('display', 'block');
	}

	const markerOverlayHeadingBackgroundTriangle = document.getElementById(
		geolocationMarkerHeadingBackgroundTriangleOverlayId,
	);
	if (markerOverlayHeadingBackgroundTriangle !== null) {
		markerOverlayHeadingBackgroundTriangle.style.setProperty('display', 'block');
	}
};

export const hideCompassHeadingMarker = () => {
	const markerOverlayHeadingForegroundTriangle = document.getElementById(
		geolocationMarkerHeadingForegroundTriangleOverlayId,
	);
	if (markerOverlayHeadingForegroundTriangle !== null) {
		markerOverlayHeadingForegroundTriangle.style.setProperty('display', 'none');
	}

	const markerOverlayHeadingBackgroundTriangle = document.getElementById(
		geolocationMarkerHeadingBackgroundTriangleOverlayId,
	);
	if (markerOverlayHeadingBackgroundTriangle !== null) {
		markerOverlayHeadingBackgroundTriangle.style.setProperty('display', 'none');
	}
};

export const updateMapWithGPSPosition = (map: Map, position: Coordinate | undefined, centreOnMarker: boolean) => {
	if (position !== undefined) {
		const markerOverlay = map.getOverlayById(geolocationMarkerOverlayId);
		if (markerOverlay !== null) {
			markerOverlay.setPosition(fromLonLat(position));
		}

		const markerOverlayHeadingForegroundTriangle = map.getOverlayById(
			geolocationMarkerHeadingForegroundTriangleOverlayId,
		);
		if (markerOverlayHeadingForegroundTriangle !== null) {
			markerOverlayHeadingForegroundTriangle.setPosition(fromLonLat(position));
		}

		const markerOverlayHeadingBackgroundTriangle = map.getOverlayById(
			geolocationMarkerHeadingBackgroundTriangleOverlayId,
		);
		if (markerOverlayHeadingBackgroundTriangle !== null) {
			markerOverlayHeadingBackgroundTriangle.setPosition(fromLonLat(position));
		}

		if (centreOnMarker === true) {
			updateAndCentreMapOnPosition(map, position);
		}
	}
};

export const updateAndCentreMapOnPosition = (map: Map, position: Coordinate) => {
	const view = map.getView();
	view.setCenter(fromLonLat(position));
	view.setZoom(defaultZoomLevel);
	map.setView(view);
};

export const onGeolocationChangePosition =
	(
		map: Map,
		mapHasPositionRef: React.MutableRefObject<boolean>,
		setMapHasPosition: React.Dispatch<React.SetStateAction<boolean>>,
		isFollowingGPSRef: React.MutableRefObject<boolean>,
		isUserMovingTheMapRef: React.MutableRefObject<boolean>,
		geolocationHasErrorRef: React.MutableRefObject<false | GeolocationError>,
		setGeolocationHasError: React.Dispatch<React.SetStateAction<false | GeolocationError>>,
	) =>
	(evt: BaseEvent) => {
		// Don't snap to the user's location if they're actively moving the map
		if (isUserMovingTheMapRef.current === false) {
			updateMapWithGPSPosition(map, (evt.target as Geolocation).getPosition(), isFollowingGPSRef.current);
		}

		if (mapHasPositionRef.current === false) {
			setMapHasPosition(true);
		}

		if (geolocationHasErrorRef.current !== false) {
			setGeolocationHasError(false);
		}
	};

export const onGeolocationError =
	(
		map: Map,
		mapHasPositionRef: React.MutableRefObject<boolean>,
		setMapHasPosition: React.Dispatch<React.SetStateAction<boolean>>,
		setGeolocationHasError: React.Dispatch<React.SetStateAction<false | GeolocationError>>,
	) =>
	(evt: GeolocationError) => {
		setGeolocationHasError(evt);

		// If this is our initial load, just use our default starting point so we can at least render the map for the first time.
		if (mapHasPositionRef.current === false) {
			const view = map.getView();
			view.setCenter(fromLonLat(defaultMapStartingPoint));
			view.setZoom(defaultZoomLevel);
			map.setView(view);

			setMapHasPosition(true);
		}
	};

export const onMapClick =
	(callback: (features: MapaOpenLayersFeature[]) => void) => (evt: MapBrowserEvent<UIEvent>) => {
		const features: MapaOpenLayersFeature[] = [];

		evt.map.forEachFeatureAtPixel(
			evt.pixel,
			(feature) => {
				features.push(feature.getProperties() as MapaOpenLayersFeature);
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
	(callback: (feature: Pick<MapaFeature, 'id' | 'geom'>) => void) => (evt: BaseEvent | Event) => {
		const target = document.getElementById(mapTargetElementId);

		if (target !== null) {
			const e = evt as ModifyEvent;
			target.style.cursor = e.type === 'modifystart' ? 'grabbing' : 'pointer';

			if (e.type === 'modifyend') {
				e.features.forEach((feature) => {
					const point = feature.getGeometry() as Point;

					if (point.getType() === 'Point') {
						const { id } = feature.getProperties() as MapaFeature;
						callback({
							id,
							geom: getPointGeoJSONFromCoordinates(point),
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
