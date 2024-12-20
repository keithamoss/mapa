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
export const geolocationMarkerHeadingForegroundTriangleOvelayId = 'geolocation_marker_heading_foreground_triangle';
export const geolocationMarkerHeadingBackgroundTriangleOvelayId = 'geolocation_marker_heading_background_triangle';

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

	return new Overlay({
		id: markerElementOverlayId,
		positioning: 'center-center',
		element: markerEl,
		stopEvent: false,
	});
};

export const enableGeolocationMarkerAndMaybeHeadingFollowing = (followingHeading: boolean) => {
	const markerOverlay = document.getElementById(geolocationMarkerOverlayId);
	if (markerOverlay !== null) {
		// If changing this, update olMap.css
		markerOverlay.style.setProperty('animation', 'pulse-marker 2s infinite');
	}

	if (followingHeading === true) {
		enableGeolocationHeadingMarkerFollowing();
	}
};

export const enableGeolocationHeadingMarkerFollowing = () => {
	const markerOverlayHeadingForegroundTriangle = document.getElementById(
		geolocationMarkerHeadingForegroundTriangleOvelayId,
	);
	if (markerOverlayHeadingForegroundTriangle !== null) {
		markerOverlayHeadingForegroundTriangle.style.setProperty('display', 'block');
	}

	const markerOverlayHeadingBackgroundTriangle = document.getElementById(
		geolocationMarkerHeadingBackgroundTriangleOvelayId,
	);
	if (markerOverlayHeadingBackgroundTriangle !== null) {
		markerOverlayHeadingBackgroundTriangle.style.setProperty('display', 'block');
	}
};

export const disableGeolocationMarkerAndHeadingFollowing = () => {
	const markerOverlay = document.getElementById(geolocationMarkerOverlayId);
	if (markerOverlay !== null) {
		markerOverlay.style.setProperty('animation', 'none');
	}

	disableGeolocationHeadingMarkerFollowing();
};

export const disableGeolocationHeadingMarkerFollowing = () => {
	const markerOverlayHeadingForegroundTriangle = document.getElementById(
		geolocationMarkerHeadingForegroundTriangleOvelayId,
	);
	if (markerOverlayHeadingForegroundTriangle !== null) {
		markerOverlayHeadingForegroundTriangle.style.setProperty('display', 'none');
	}

	const markerOverlayHeadingBackgroundTriangle = document.getElementById(
		geolocationMarkerHeadingBackgroundTriangleOvelayId,
	);
	if (markerOverlayHeadingBackgroundTriangle !== null) {
		markerOverlayHeadingBackgroundTriangle.style.setProperty('display', 'none');
	}
};

export const degreesToRadians = (deg: number) => (deg * Math.PI * 2) / 360;

export const updateMapWithGPSPosition = (
	map: Map,
	position: Coordinate | undefined,
	heading: number | undefined,
	centreOnMarker: boolean,
) => {
	if (position !== undefined) {
		const markerOverlay = map.getOverlayById(geolocationMarkerOverlayId);
		if (markerOverlay !== null) {
			markerOverlay.setPosition(fromLonLat(position));
		}

		const markerOverlayHeadingForegroundTriangle = map.getOverlayById(
			geolocationMarkerHeadingForegroundTriangleOvelayId,
		);
		if (markerOverlayHeadingForegroundTriangle !== null) {
			markerOverlayHeadingForegroundTriangle.setPosition(fromLonLat(position));
		}

		const markerOverlayHeadingBackgroundTriangle = map.getOverlayById(
			geolocationMarkerHeadingBackgroundTriangleOvelayId,
		);
		if (markerOverlayHeadingBackgroundTriangle !== null) {
			markerOverlayHeadingBackgroundTriangle.setPosition(fromLonLat(position));
		}

		if (centreOnMarker === true) {
			const view = map.getView();
			view.setCenter(fromLonLat(position));
			view.setRotation(degreesToRadians(heading || 0));
			view.setZoom(defaultZoomLevel);
			map.setView(view);
		}
	}
};

export const onGeolocationChangePosition =
	(
		map: Map,
		mapHasPositionRef: React.MutableRefObject<boolean>,
		setMapHasPosition: React.Dispatch<React.SetStateAction<boolean>>,
		isFollowingGPSRef: React.MutableRefObject<boolean>,
		isFollowingHeadingRef: React.MutableRefObject<boolean>,
		isUserMovingTheMapRef: React.MutableRefObject<boolean>,
		geolocationHasErrorRef: React.MutableRefObject<false | GeolocationError>,
		setGeolocationHasError: React.Dispatch<React.SetStateAction<false | GeolocationError>>,
	) =>
	(evt: BaseEvent) => {
		// Don't snap to the user's location if they're actively moving the map
		if (isUserMovingTheMapRef.current === false) {
			updateMapWithGPSPosition(
				map,
				(evt.target as Geolocation).getPosition(),
				isFollowingHeadingRef.current === true ? (evt.target as Geolocation).getHeading() : 0,
				isFollowingGPSRef.current,
			);
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
	(callback: (feature: Partial<MapaFeature>) => void) => (evt: BaseEvent | Event) => {
		const target = document.getElementById(mapTargetElementId);

		if (target !== null) {
			const e = evt as ModifyEvent;
			target.style.cursor = e.type === 'modifystart' ? 'grabbing' : 'pointer';

			if (e.type === 'modifyend') {
				e.features.forEach((feature) => {
					const point = feature.getGeometry() as Point;

					if (point.getType() === 'Point') {
						const { id, geom_type, map_id } = feature.getProperties() as MapaFeature;
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
