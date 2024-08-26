import { Alert, AlertTitle, Box, Button, styled } from '@mui/material';
import { MapBrowserEvent, MapEvent } from 'ol';
import Feature from 'ol/Feature';
import Geolocation, { GeolocationError } from 'ol/Geolocation';
import Map from 'ol/Map';
import { unByKey } from 'ol/Observable';
import Attribution from 'ol/control/Attribution';
import { Geometry } from 'ol/geom';
import { DblClickDragZoom, MouseWheelZoom, defaults as defaultInteractions } from 'ol/interaction';
import VectorImageLayer from 'ol/layer/VectorImage';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import 'ol/ol.css';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { Basemap, BasemapStyle, MapRenderer } from '../../app/services/auth';
import {
	MapaFeature,
	MapaOpenLayersFeature,
	useUpdateFeaturePositionForOLModifyInteractionMutation,
} from '../../app/services/features';
import { Map as MapaMap } from '../../app/services/maps';
import {
	getSearchLocationsParameters,
	getSearchLocationsZoomToCoordinates,
	isMapLoadingViaRTKOrManuallySpecified,
	selectGeoJSONFeaturesAndSpriteSheet,
	setFeaturesAvailableForEditing,
	setMapView,
	setSearchLocationsZoomToCoordinates,
} from '../app/appSlice';
import { selectMapById } from '../maps/mapsSlice';
import FeatureMovementButton from './controls/featureMovementButton';
import FollowHeadingButton from './controls/followHeadingButton';
import QuickAddSymbolsControl from './controls/quickAddSymbolsControl';
import SearchLocationsButton from './controls/searchLocationsButton';
import SnapToGPSButton from './controls/snapToGPSButton';
import LocationFetchingIndicator from './locationFetchingIndicator';
import './olMap.css';
import './olMapCore.css';
import {
	DeviceOrientationListenerManager,
	MapHeadingStatus,
	requestDeviceOrientationPermissionAndOrAddListener,
	setMapRotation,
	setOverlayElementRotation,
} from './olMapDeviceOrientationHelpers';
import {
	createGeolocationMarkerOverlay,
	defaultZoomLevel,
	geolocationMarkerHeadingBackgroundTriangleOverlayId,
	geolocationMarkerHeadingForegroundTriangleOverlayId,
	geolocationMarkerOverlayId,
	getBasemap,
	getMapInitialView,
	getMapOverlayElementAsDiv,
	getMapStartingZoomLevel,
	hideCompassHeadingMarker,
	isMapaMapFollowingGPS,
	mapTargetElementId,
	onGeolocationChangePosition,
	onGeolocationError,
	onMapClick,
	onModifyInteractionAddRemoveFeature,
	onModifyInteractionStartEnd,
	setModifyInteractionStatus,
	showCompassHeadingMarker,
	updateAndCentreMapOnPosition,
	updateMapWithGPSPosition,
} from './olMapHelpers';
import { manageVectorImageLayerCreation, manageVectorImageLayerUpdate } from './olVectorImageLayerManager';
import { manageWebGLPointsLayerCreation, manageWebGLPointsLayerUpdate } from './olWebGLPointsLayerManager';

const MapButtonsContainer = styled(Box)(({ theme }) => ({
	position: 'absolute',
	zIndex: theme.zIndex.speedDial + 1, // See note in App.tsx and MapsSwitcher.tsx
	top: theme.spacing(2),
	right: theme.spacing(2),
	width: 50,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
	position: 'absolute',
	// Ensure this sits 1 above MapButtonsContainer so you can close the alert's without the QuickAdd buttons getting in the way
	zIndex: theme.zIndex.speedDial + 2, // See note in App.tsx
	bottom: 160,
	ml: 1,
	mr: 1,
	width: '90%',
}));

interface EntrypointLayer1Props {
	mapId: number;
	mapRenderer: MapRenderer;
	basemap: Basemap;
	basemap_style: BasemapStyle;
}

function EntrypointLayer1(props: EntrypointLayer1Props) {
	const { mapId, ...rest } = props;

	const map = useAppSelector((state) => selectMapById(state, mapId));

	if (map === undefined) {
		return null;
	}

	return <OLMap mapaMap={map} {...rest} />;
}

// Inspo:
// https://taylor.callsen.me/using-openlayers-with-react-functional-components/
// https://medium.com/swlh/how-to-incorporate-openlayers-maps-into-react-65b411985744

interface Props {
	mapaMap: MapaMap;
	mapRenderer: MapRenderer;
	basemap: Basemap;
	basemap_style: BasemapStyle;
}

function OLMap(props: Props) {
	const { mapaMap, mapRenderer, basemap, basemap_style } = props;

	// console.log('# olMap rendering');

	const dispatch = useAppDispatch();

	const navigate = useNavigate();

	const mapStartingZoomLevel = getMapStartingZoomLevel(mapaMap.starting_location);

	// Note: We useRef() for mapHasPosition and isFeatureMovementAllowed to avoid passing state to useEffect()

	// ######################
	// OpenLayers Map
	// ######################
	const [map, setMap] = useState<Map>();

	// Create state ref that can be accessed in OpenLayers callback functions et cetera
	// https://stackoverflow.com/a/60643670
	const mapRef = useRef<Map>();
	mapRef.current = map;

	// Used to let the component know that a new OL map has been created (e.g. when we're switching between maps) so it knows it needs to re-initialise a number of pieces of state
	const mapReadyToBeReinitialisedRef = useRef<boolean>(false);

	const isMapLoading = useAppSelector(isMapLoadingViaRTKOrManuallySpecified);

	const featuresAndSpriteSheet = useAppSelector(selectGeoJSONFeaturesAndSpriteSheet);
	// console.log('🚀 ~ file: olMap.tsx:84 ~ OLMap ~ featuresAndSpriteSheet:', featuresAndSpriteSheet);

	const vectorLayer = useRef<
		VectorImageLayer<VectorSource<Feature<Geometry>>> | WebGLPointsLayer<VectorSource<Feature<Geometry>>> | undefined
	>(undefined);
	// ######################
	// OpenLayers Map (End)
	// ######################

	// ######################
	// Zoom To Mapbox Search
	// ######################
	const searchLocationsParameters = useAppSelector(getSearchLocationsParameters);

	const zoomToCoordinates = useAppSelector(getSearchLocationsZoomToCoordinates);

	useEffect(() => {
		if (mapRef.current !== undefined && zoomToCoordinates !== undefined) {
			setIsFollowingGPS(false);
			updateAndCentreMapOnPosition(mapRef.current, zoomToCoordinates, defaultZoomLevel);
			setMapHasPosition(true); // Highly unlikely, be just in case the map doesn't have a position yet.
			dispatch(setSearchLocationsZoomToCoordinates(undefined));
		}
	}, [dispatch, zoomToCoordinates]);
	// ######################
	// Zoom To Mapbox Search (End)
	// ######################

	// ######################
	// Device Orientation
	// ######################
	// Ref: https://stackoverflow.com/a/75792197/7368493
	// Ref: https://stackoverflow.com/a/26275869/7368493
	// Ref: https://dev.opera.com/articles/w3c-device-orientation-usage/ circa 2014 - just skimmed it, appears to be what we had to do prior to Device Orientation Absolute being supported. Keeping it here as a potentially useful historical reference.
	const deviceOrientationCompassHeadingRef = useRef<number | undefined>(undefined);

	const deviceOrientationListenerManagerRef = useRef(new DeviceOrientationListenerManager());

	const isFollowingHeadingRequestAnimationFrameIdRef = useRef<number | undefined>(undefined);

	// const fakeDataGenerationRef = useRef<number[]>([]);

	const [isFollowingHeadingStatus, setIsFollowingHeadingStatus] = useState(MapHeadingStatus.Off);
	const isFollowingHeadingStatusRef = useRef<MapHeadingStatus>(isFollowingHeadingStatus);
	isFollowingHeadingStatusRef.current = isFollowingHeadingStatus;

	const geolocationMarkerHeadingForegroundTriangleOverlayDiv = useRef<HTMLDivElement | undefined>(undefined);
	const geolocationMarkerHeadingBackgroundTriangleOverlayDiv = useRef<HTMLDivElement | undefined>(undefined);

	// Once Safari on iOS supports the 'checkVisibility' part of Intersection Observer v2 we might be able to use that to pause RAF when the map is not visible.
	// We went down a short rabbit hole of using <DialogWithTransition>, but then realised we'd have to rejig all of our many uses of the component to contain the <AppBar> that fires onClose() as well.
	// So far now, we're just leaving RAF being called all of the time and hoping that's OK.

	// We're potentially running at 60 - 144 FPS in here and are doing nothing to throttle it...yet.
	// There is the timestamp that's passed to the callback that we could use to throttle.
	// Ref: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
	const requestAnimationFrameCallback = useCallback(() => {
		if (deviceOrientationCompassHeadingRef.current !== undefined) {
			const compassHeading = Math.round(deviceOrientationCompassHeadingRef.current);

			// fakeDataGenerationRef.current?.push(compassHeading);

			if (isFollowingHeadingStatusRef.current === MapHeadingStatus.On) {
				setOverlayElementRotation(
					compassHeading,
					geolocationMarkerHeadingForegroundTriangleOverlayDiv,
					geolocationMarkerHeadingBackgroundTriangleOverlayDiv,
				);
			} else if (isFollowingHeadingStatusRef.current === MapHeadingStatus.OnAndMapFollowing) {
				setMapRotation(mapRef.current, compassHeading);
			}
		}

		isFollowingHeadingRequestAnimationFrameIdRef.current = window.requestAnimationFrame(requestAnimationFrameCallback);
	}, []);

	useEffect(() => {
		switch (isFollowingHeadingStatus) {
			case MapHeadingStatus.Off:
			case MapHeadingStatus.Unsupported:
			case MapHeadingStatus.Denied:
				deviceOrientationListenerManagerRef.current.removeListener();

				if (isFollowingHeadingRequestAnimationFrameIdRef.current !== undefined) {
					window.cancelAnimationFrame(isFollowingHeadingRequestAnimationFrameIdRef.current);
					isFollowingHeadingRequestAnimationFrameIdRef.current = undefined;
				}

				hideCompassHeadingMarker();
				break;

			case MapHeadingStatus.On:
			case MapHeadingStatus.OnAndMapFollowing:
				if (isFollowingHeadingRequestAnimationFrameIdRef.current === undefined) {
					isFollowingHeadingRequestAnimationFrameIdRef.current =
						window.requestAnimationFrame(requestAnimationFrameCallback);
				}

				showCompassHeadingMarker();
				break;
		}
	}, [isFollowingHeadingStatus, requestAnimationFrameCallback]);

	const onFollowHeadingOn = useCallback(() => {
		// This function will set MapHeadingStatus.On is we have permissions and the device supports it.
		// Safari on iOS also requires the user to take an action to request permissions (this is that action).
		requestDeviceOrientationPermissionAndOrAddListener(
			deviceOrientationListenerManagerRef,
			deviceOrientationCompassHeadingRef,
			isFollowingHeadingStatusRef,
			setIsFollowingHeadingStatus,
		);
	}, []);

	const onFollowHeadingOnAndMapFollowing = useCallback(() => {
		setIsFollowingHeadingStatus(MapHeadingStatus.OnAndMapFollowing);

		// Set the compass heading marker back to north now that the map itself is following the compass
		setOverlayElementRotation(
			0,
			geolocationMarkerHeadingForegroundTriangleOverlayDiv,
			geolocationMarkerHeadingBackgroundTriangleOverlayDiv,
		);
	}, []);

	const onFollowHeadingOff = useCallback(() => {
		setIsFollowingHeadingStatus(MapHeadingStatus.Off);

		// Set the compass heading marker and the map back to point to north
		setOverlayElementRotation(
			0,
			geolocationMarkerHeadingForegroundTriangleOverlayDiv,
			geolocationMarkerHeadingBackgroundTriangleOverlayDiv,
		);
		setMapRotation(mapRef.current, 0);

		// console.log('fakeDataGenerationRef.current', fakeDataGenerationRef.current);
	}, []);

	const [isShowingFollowHeadingDeniedAlert, setIsShowingFollowHeadingDeniedAlert] = useState(false);

	const onFollowHeadingDenied = useCallback(() => {
		setIsShowingFollowHeadingDeniedAlert(true);
	}, []);

	const onCloseFollowHeadingDeniedAlert = useCallback(() => {
		setIsShowingFollowHeadingDeniedAlert(false);
	}, []);
	// ######################
	// Device Orientation (End)
	// ######################

	// ######################
	// Geolocation
	// ######################
	const geolocation = useRef<Geolocation>(
		new Geolocation({
			trackingOptions: {
				enableHighAccuracy: true,
				// timeout: Infinity, // Always wait until the position is returned
				timeout: 4000,
				maximumAge: 60000, // Use cached position for up to 10s
			},
		}),
	);

	// The map only has a starting location from the get-go if the user has defined both the zoom and centre
	const [mapHasPosition, setMapHasPosition] = useState<boolean>(
		mapaMap.starting_location !== null &&
			mapaMap.starting_location.zoom !== undefined &&
			mapaMap.starting_location.centre !== undefined,
	);
	const mapHasPositionRef = useRef<boolean>(mapHasPosition);
	mapHasPositionRef.current = mapHasPosition;

	const [geolocationHasError, setGeolocationHasError] = useState<false | GeolocationError>(false);
	const geolocationHasErrorRef = useRef<false | GeolocationError>(geolocationHasError);
	geolocationHasErrorRef.current = geolocationHasError;

	// We follow (i.e. snap the map to) the user's GPS location if no starting location is set or if a starting location is set, but they've only set the zoom level
	const [isFollowingGPS, setIsFollowingGPS] = useState(isMapaMapFollowingGPS(mapaMap.starting_location));
	const isFollowingGPSRef = useRef<boolean>(isFollowingGPS);
	isFollowingGPSRef.current = isFollowingGPS;

	const [isUserMovingTheMap, setIsUserMovingTheMap] = useState(false);
	const isUserMovingTheMapRef = useRef<boolean>(isUserMovingTheMap);
	isUserMovingTheMapRef.current = isUserMovingTheMap;

	// If the user switches maps through MapsSwitcher, we need to re-initialise location and heading following
	useEffect(() => {
		if (mapReadyToBeReinitialisedRef.current === true) {
			// Make sure we snap to (or stop snapping to) the user's GPS location based on the needs of the map
			const isFollowingGPSForNewMap = isMapaMapFollowingGPS(mapaMap.starting_location);
			if (isFollowingGPS !== isFollowingGPSForNewMap) {
				setIsFollowingGPS(isFollowingGPSForNewMap);
			}

			// And make sure the user's current location is updated on the map as required
			// Without this call, it won't immediately update until the user's position actually changes in the real world
			if (map !== undefined) {
				const currentPosition = geolocation.current.getPosition();

				if (currentPosition !== undefined) {
					updateMapWithGPSPosition(map, currentPosition, isFollowingGPSForNewMap, mapStartingZoomLevel);
				}
			}

			// And because switching maps recreates a whole new OL map, we also need to reattach the RAF for the heading indicator
			if (
				isFollowingHeadingStatus === MapHeadingStatus.On ||
				isFollowingHeadingStatus === MapHeadingStatus.OnAndMapFollowing
			) {
				if (isFollowingHeadingRequestAnimationFrameIdRef.current === undefined) {
					isFollowingHeadingRequestAnimationFrameIdRef.current =
						window.requestAnimationFrame(requestAnimationFrameCallback);
				}

				showCompassHeadingMarker();
			}

			mapReadyToBeReinitialisedRef.current = false;
		}
	}, [
		isFollowingGPS,
		isFollowingHeadingStatus,
		map,
		mapStartingZoomLevel,
		mapaMap.starting_location,
		requestAnimationFrameCallback,
	]);

	const onFollowGPSEnabled = useCallback(() => {
		setIsFollowingGPS(true);

		// When we re-enable location following, grab the current location and snap the map to it.
		if (mapRef.current !== undefined) {
			const currentPosition = geolocation.current.getPosition();
			if (currentPosition !== undefined) {
				updateMapWithGPSPosition(mapRef.current, currentPosition, true, mapStartingZoomLevel);
			}
		}
	}, [mapStartingZoomLevel]);

	const onFollowGPSDisabled = useCallback(() => {
		setIsFollowingGPS(false);
	}, []);

	const onClickTryAndGetGPSLocationAgain = useCallback(() => {
		setGeolocationHasError(false);

		if (mapRef.current !== undefined) {
			const currentPosition = geolocation.current.getPosition();
			if (currentPosition !== undefined) {
				updateMapWithGPSPosition(mapRef.current, currentPosition, isFollowingGPS, mapStartingZoomLevel);
			}
		}
	}, [isFollowingGPS, mapStartingZoomLevel]);

	const onCloseAlertDoNowt = useCallback(() => {}, []);
	// ######################
	// Geolocation (End)
	// ######################

	// ######################
	// Feature Movement
	// ######################
	const [isFeatureMovementAllowed, setIsFeatureMovementAllowed] = useState(false);

	const isFeatureMovementAllowedRef = useRef<boolean>(false);
	isFeatureMovementAllowedRef.current = isFeatureMovementAllowed;

	const modifyInteractionStartEndRef = useRef(
		onModifyInteractionStartEnd((feature: Pick<MapaFeature, 'id' | 'geom'>) => updateFeaturePosition(feature)),
	);

	const [updateFeaturePosition] = useUpdateFeaturePositionForOLModifyInteractionMutation();

	const onFeatureMovementEnabled = useCallback(() => {
		setModifyInteractionStatus(mapRef.current, true);
		setIsFeatureMovementAllowed(true);
	}, []);

	const onFeatureMovementDisabled = useCallback(() => {
		setModifyInteractionStatus(mapRef.current, false);
		setIsFeatureMovementAllowed(false);
	}, []);
	// ######################
	// Feature Movement (End)
	// ######################

	// ######################
	// Initialise map on load
	// ######################
	useEffect(() => {
		// console.log('useEffect init');

		if (mapRef.current === undefined) {
			// console.log('Making a map');

			// Make a local copy in useEffect() otherwise it'll complain about how it's probably changed by the time the return (aka 'on unmount') fires to handle removing listeners
			const deviceOrientationListenerManagerRefCopy = deviceOrientationListenerManagerRef.current;

			geolocation.current.setTracking(true);
			const currentPosition = geolocation.current.getPosition();

			let isScrollZooming = false;

			const initialMap = new Map({
				target: mapTargetElementId,
				interactions: defaultInteractions({ mouseWheelZoom: false }).extend([
					new DblClickDragZoom(),
					new MouseWheelZoom({
						condition: (mapBrowserEvent) => {
							if (mapBrowserEvent.type === 'wheel' && isScrollZooming === false) {
								isScrollZooming = true;
							}

							return true;
						},
					}),
				]),
				layers: [getBasemap(basemap, basemap_style)],
				controls: [new Attribution({ collapsible: false })],
				view: getMapInitialView(currentPosition, mapaMap),
			});

			// ######################
			// Geolocation
			// ######################
			initialMap.addOverlay(createGeolocationMarkerOverlay(geolocationMarkerOverlayId));
			initialMap.addOverlay(createGeolocationMarkerOverlay(geolocationMarkerHeadingForegroundTriangleOverlayId));
			initialMap.addOverlay(createGeolocationMarkerOverlay(geolocationMarkerHeadingBackgroundTriangleOverlayId));

			geolocationMarkerHeadingForegroundTriangleOverlayDiv.current = getMapOverlayElementAsDiv(
				`container_${geolocationMarkerHeadingForegroundTriangleOverlayId}`,
			);
			geolocationMarkerHeadingBackgroundTriangleOverlayDiv.current = getMapOverlayElementAsDiv(
				`container_${geolocationMarkerHeadingBackgroundTriangleOverlayId}`,
			);

			const geolocationEventKeys = [
				geolocation.current.on(
					'change:position',
					onGeolocationChangePosition(
						initialMap,
						mapHasPositionRef,
						setMapHasPosition,
						mapStartingZoomLevel,
						isFollowingGPSRef,
						setIsFollowingGPS,
						isUserMovingTheMapRef,
						geolocationHasErrorRef,
						setGeolocationHasError,
					),
				),
				geolocation.current.on(
					'error',
					onGeolocationError(
						initialMap,
						mapHasPositionRef,
						setMapHasPosition,
						setGeolocationHasError,
						setIsFollowingGPS,
					),
				),
			];
			// ######################
			// Geolocation (End)
			// ######################

			// ######################
			// Device Orientation
			// ######################
			// Attach a Device Orientation listener if we don't yet know if this browser + device combo has a accelerometer + magnetometer yet (or a accelerometer + magnetometer that we need to ask permissions to use)
			if (isFollowingHeadingStatusRef.current !== MapHeadingStatus.Unsupported) {
				requestDeviceOrientationPermissionAndOrAddListener(
					deviceOrientationListenerManagerRef,
					deviceOrientationCompassHeadingRef,
					isFollowingHeadingStatusRef,
					setIsFollowingHeadingStatus,
				);
			}
			// ######################
			// Device Orientation (End)
			// ######################

			// ######################
			// Drag Detection, Map View Updating, and Feature Clicking
			// ######################
			// If a 'pointerdrag' fires between 'movestart' and 'moveend' the move has been the result of a drag
			// Ref: https://gis.stackexchange.com/a/378877
			let isDragging = false;
			let isDoubleClicking = false;

			initialMap.on('movestart', () => {
				isDragging = false;
				setIsUserMovingTheMap(true);
			});

			initialMap.on('pointerdrag', () => {
				isDragging = true;
			});

			initialMap.on('moveend', (evt: MapEvent) => {
				setIsUserMovingTheMap(false);

				if (
					(isDragging === true || isDoubleClicking === true || isScrollZooming === true) &&
					geolocation.current.getTracking() === true
				) {
					setIsFollowingGPS(false);
				}

				isDragging = false;
				isDoubleClicking = false;
				isScrollZooming = false;

				// Update the Redux store version of the view for when
				// we add new features.
				const view = evt.map.getView();

				dispatch(
					setMapView({
						center: view.getCenter(),
						zoom: view.getZoom(),
						resolution: view.getResolution(),
					}),
				);
			});

			initialMap.on(
				'click',
				onMapClick((features: MapaOpenLayersFeature[]) => {
					dispatch(
						setFeaturesAvailableForEditing(
							features.map((f) => {
								const { geometry, ...rest } = f;

								return {
									...rest,
									geom: {
										type: 'Point',
										coordinates: transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326'),
									},
								};
							}),
						),
					);

					if (features.length === 1) {
						navigate(`/FeatureManager/Edit/${features[0].id}`);
					} else if (features.length > 1) {
						// Without this, for some reason the <DialogWithTransition> in FeatureManager was closing its dialog
						// due to a click on the background as soon as it opened. i.e. we see a brief flash of it appearing and then gone.
						// I guess somehow it was comimg up so fast while the map was being was clicked and the same event triggered it?
						window.setTimeout(() => {
							navigate('/FeatureManager');
						}, 50);
					}
				}),
			);

			initialMap.on('dblclick', (evt: MapBrowserEvent<UIEvent>) => {
				evt.preventDefault();

				isDoubleClicking = true;

				const view = initialMap.getView();
				view.setCenter(evt.coordinate);
				initialMap.setView(view);

				return false;
			});
			// ######################
			// Drag Detection, Map View Updating, and Feature Clicking (End)
			// ######################

			setMap(initialMap);
			mapRef.current = initialMap;

			mapReadyToBeReinitialisedRef.current = true;

			return () => {
				// console.log('Cleanup OLMap');

				vectorLayer.current = undefined;

				unByKey(geolocationEventKeys);

				initialMap.setTarget(undefined);

				if (mapRef.current !== undefined) {
					mapRef.current.setTarget(undefined);
					mapRef.current = undefined;
				}

				deviceOrientationListenerManagerRefCopy.removeListener();

				if (isFollowingHeadingRequestAnimationFrameIdRef.current !== undefined) {
					window.cancelAnimationFrame(isFollowingHeadingRequestAnimationFrameIdRef.current);
					isFollowingHeadingRequestAnimationFrameIdRef.current = undefined;
				}

				setMap(undefined);
			};
		}

		// Note: basemap is not strictly needed in here because any changes to it from
		// the settings panel are done via a full page reload.
	}, [basemap, basemap_style, dispatch, navigate, mapaMap, mapStartingZoomLevel]);
	// ######################
	// Initialise map on load (End)
	// ######################

	// ######################
	// Data Layer
	// ######################
	// Note: This will get a lot cleaner once OL supports defining
	// styles for WebGL layers using a flat style object/function.
	useEffect(() => {
		// console.log('create/update data layer');

		if (mapRef.current !== undefined && mapRenderer === MapRenderer.VectorImageLayer) {
			// Note: When switching map renderers via the Settings panel, vectorLayer.current
			// will briefly point to the old layer while the page is refreshing.
			// This will trigger an error briefly before the page gets to reloading, so no biggie.
			if (vectorLayer.current === undefined) {
				// console.log('> manage vector layer: create VectorImageLayer');

				vectorLayer.current = manageVectorImageLayerCreation(
					featuresAndSpriteSheet.geoJSON,
					mapRef.current,
					isFeatureMovementAllowedRef.current,
					modifyInteractionStartEndRef.current,
					onModifyInteractionAddRemoveFeature,
				);
			} else {
				// console.log('> manage vector layer: update VectorImageLayer layer');

				manageVectorImageLayerUpdate(
					featuresAndSpriteSheet.geoJSON,
					vectorLayer.current as VectorImageLayer<VectorSource<Feature<Geometry>>>,
				);
			}
		} else if (mapRef.current !== undefined && mapRenderer === MapRenderer.WebGLPointsLayer) {
			if (vectorLayer.current === undefined) {
				// console.log('> manage vector layer: create WebGLPointsLayer');

				vectorLayer.current = manageWebGLPointsLayerCreation(
					featuresAndSpriteSheet.geoJSON,
					featuresAndSpriteSheet.spriteSheet,
					mapRef.current,
					isFeatureMovementAllowedRef.current,
					modifyInteractionStartEndRef.current,
					onModifyInteractionAddRemoveFeature,
				);
			} else {
				// console.log('> manage vector layer: update WebGLPointsLayer layer');

				vectorLayer.current = manageWebGLPointsLayerUpdate(
					featuresAndSpriteSheet.geoJSON,
					featuresAndSpriteSheet.spriteSheet,
					vectorLayer.current as WebGLPointsLayer<VectorSource<Feature<Geometry>>>,
					mapRef.current,
					isFeatureMovementAllowedRef.current,
					modifyInteractionStartEndRef.current,
					onModifyInteractionAddRemoveFeature,
				);
			}
		}
	}, [featuresAndSpriteSheet.geoJSON, featuresAndSpriteSheet.spriteSheet, mapRenderer]);
	// ######################
	// Data Layer (End)
	// ######################

	return (
		<div className="map-container">
			<div id={mapTargetElementId} />

			{mapHasPosition === false ? (
				<LocationFetchingIndicator />
			) : isMapLoading === false ? (
				<React.Fragment>
					<div id="centre_of_the_map"></div>

					<div id="workaround_modify_interaction_bug"></div>

					<MapButtonsContainer>
						<SnapToGPSButton
							isFollowingGPS={isFollowingGPS}
							onFollowGPSEnabled={onFollowGPSEnabled}
							onFollowGPSDisabled={onFollowGPSDisabled}
						/>

						<FollowHeadingButton
							status={isFollowingHeadingStatus}
							onFollowHeadingOn={onFollowHeadingOn}
							onFollowHeadingOnAndMapFollowing={onFollowHeadingOnAndMapFollowing}
							onFollowHeadingOff={onFollowHeadingOff}
							onFollowHeadingDenied={onFollowHeadingDenied}
						/>

						<FeatureMovementButton
							isFeatureMovementAllowed={isFeatureMovementAllowed}
							onFeatureMovementEnabled={onFeatureMovementEnabled}
							onFeatureMovementDisabled={onFeatureMovementDisabled}
						/>

						<SearchLocationsButton active={searchLocationsParameters.search_term.length >= 1} />

						{/* <GoogleMapsImportButton /> */}

						<QuickAddSymbolsControl />
					</MapButtonsContainer>
				</React.Fragment>
			) : (
				<React.Fragment>
					{/* I guess this would only be for mapFeatureLoadingStatus === eMapFeaturesLoadingStatus.FAILED */}
				</React.Fragment>
			)}

			{geolocationHasError !== false && (
				<StyledAlert
					severity="error"
					onClose={onCloseAlertDoNowt}
					action={
						<Button color="inherit" size="small" onClick={onClickTryAndGetGPSLocationAgain}>
							Try again
						</Button>
					}
				>
					<AlertTitle>Error determining your location</AlertTitle>
					We&lsquo;re now trying to re-establish your location. If we can&lsquo;t, please try refreshing or restarting
					the app and report it to the developer.
					<br />
					Type: {geolocationHasError.type}, Code: {geolocationHasError.code}, Message: {geolocationHasError.message}
				</StyledAlert>
			)}

			{isShowingFollowHeadingDeniedAlert === true && (
				<StyledAlert severity="error" onClose={onCloseFollowHeadingDeniedAlert}>
					<AlertTitle>You have denied permissions to use your device&apos;s accelerometer and magnetometer</AlertTitle>
					To reset it, simply close and open the app again.
				</StyledAlert>
			)}

			{/* {isFollowingHeadingStatus === MapHeadingStatus.Unsupported && (
				<Alert
					severity="error"
					sx={{ zIndex: 30, position: 'absolute', bottom: 160, ml: 1, mr: 1, width: '90%' }}
					onClose={onCloseAlertDoNowt}
				>
					<AlertTitle>Your device doesn&apos;st seem to have a accelerometer and a magnetometer</AlertTitle>
					So we&apos;ve removed the option to show which direction you&apos;re facing.
				</Alert>
			)} */}
		</div>
	);
}

export default EntrypointLayer1;
