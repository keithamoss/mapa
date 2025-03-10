import { Alert, AlertTitle } from '@mui/material';
import { MapBrowserEvent, MapEvent, View } from 'ol';
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
import { fromLonLat, transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { Basemap, BasemapStyle, MapRenderer } from '../../app/services/auth';
import { MapaFeature, MapaOpenLayersFeature, useUpdateFeatureMutation } from '../../app/services/features';
import {
	eMapFeaturesLoadingStatus,
	getMapFeatureLoadingStatus,
	selectGeoJSONFeaturesAndSpriteSheet,
	setFeaturesAvailableForEditing,
	setMapView,
} from '../app/appSlice';
import FeatureMovementButton from './controls/featureMovementButton';
import FollowHeadingButton from './controls/followHeadingButton';
import QuickAddSymbolsControl from './controls/quickAddSymbolsControl';
import SnapToGPSButton from './controls/snapToGPSButton';
import LocationFetchingIndicator from './locationFetchingIndicator';
import './olMap.css';
import {
	createGeolocationMarkerOverlay,
	defaultZoomLevel,
	disableGeolocationHeadingMarkerFollowing,
	disableGeolocationMarkerAndHeadingFollowing,
	enableGeolocationMarkerAndMaybeHeadingFollowing,
	geolocationMarkerHeadingBackgroundTriangleOvelayId,
	geolocationMarkerHeadingForegroundTriangleOvelayId,
	geolocationMarkerOverlayId,
	getBasemap,
	mapTargetElementId,
	onGeolocationChangePosition,
	onGeolocationError,
	onMapClick,
	onModifyInteractionAddRemoveFeature,
	onModifyInteractionStartEnd,
	setModifyInteractionStatus,
	updateMapWithGPSPosition,
} from './olMapHelpers';
import { manageVectorImageLayerCreation, manageVectorImageLayerUpdate } from './olVectorImageLayerManager';
import { manageWebGLPointsLayerCreation, manageWebGLPointsLayerUpdate } from './olWebGLPointsLayerManager';

// Inspo:
// https://taylor.callsen.me/using-openlayers-with-react-functional-components/
// https://medium.com/swlh/how-to-incorporate-openlayers-maps-into-react-65b411985744

interface Props {
	mapRenderer: MapRenderer;
	basemap: Basemap;
	basemap_style: BasemapStyle;
}

function OLMap(props: Props) {
	// console.log('# olMap rendering');

	const dispatch = useAppDispatch();

	const navigate = useNavigate();

	const { mapRenderer, basemap, basemap_style } = props;

	// Note: We useRef() for mapHasPosition and isFeatureMovementAllowed to avoid passing state to useEffect()

	// ######################
	// OpenLayers Map
	// ######################
	const [map, setMap] = useState<Map>();

	// Create state ref that can be accessed in OpenLayers callback functions et cetera
	// https://stackoverflow.com/a/60643670
	const mapRef = useRef<Map>();
	mapRef.current = map;

	const mapFeatureLoadingStatus = useAppSelector(getMapFeatureLoadingStatus);

	const featuresAndSpriteSheet = useAppSelector(selectGeoJSONFeaturesAndSpriteSheet);
	// console.log('🚀 ~ file: olMap.tsx:84 ~ OLMap ~ featuresAndSpriteSheet:', featuresAndSpriteSheet);

	const vectorLayer = useRef<
		VectorImageLayer<VectorSource<Feature<Geometry>>> | WebGLPointsLayer<VectorSource<Feature<Geometry>>> | undefined
	>(undefined);
	// ######################
	// OpenLayers Map (End)
	// ######################

	// ######################
	// Geolocation
	// ######################
	const geolocation = useRef<Geolocation>(
		new Geolocation({
			trackingOptions: {
				enableHighAccuracy: true,
				timeout: Infinity, // Always wait until the position is returned
				// timeout: 2000,
				maximumAge: 60000, // Use cached position for up to 10s
			},
		}),
	);

	const [mapHasPosition, setMapHasPosition] = useState<boolean>(false);
	const mapHasPositionRef = useRef<boolean>(mapHasPosition);
	mapHasPositionRef.current = mapHasPosition;

	const [geolocationHasError, setGeolocationHasError] = useState<false | GeolocationError>(false);
	const geolocationHasErrorRef = useRef<false | GeolocationError>(geolocationHasError);
	geolocationHasErrorRef.current = geolocationHasError;

	const [isFollowingGPS, setIsFollowingGPS] = useState(true);
	const isFollowingGPSRef = useRef<boolean>(isFollowingGPS);
	isFollowingGPSRef.current = isFollowingGPS;

	const [isFollowingHeading, setIsFollowingHeading] = useState(true);
	const isFollowingHeadingRef = useRef<boolean>(isFollowingHeading);
	isFollowingHeadingRef.current = isFollowingHeading;

	const [isFollowingHeadingPrevious, setIsFollowingHeadingPrevious] = useState(true);
	const isFollowingHeadingPreviousRef = useRef<boolean>(isFollowingHeadingPrevious);
	isFollowingHeadingPreviousRef.current = isFollowingHeadingPrevious;

	const [isUserMovingTheMap, setIsUserMovingTheMap] = useState(false);
	const isUserMovingTheMapRef = useRef<boolean>(isUserMovingTheMap);
	isUserMovingTheMapRef.current = isUserMovingTheMap;

	const onFollowGPSEnabled = useCallback(() => {
		setIsFollowingGPS(true);
		setIsFollowingHeading(isFollowingHeadingPreviousRef.current);

		enableGeolocationMarkerAndMaybeHeadingFollowing(isFollowingHeadingPreviousRef.current);

		// When we re-enable location following, grab the current location and snap the map to it.
		// If we're following the user's heading as well, then let's re-orient to that.
		if (mapRef.current !== undefined) {
			const currentPosition = geolocation.current.getPosition();
			const currentHeading = isFollowingHeadingPreviousRef.current === true ? geolocation.current.getHeading() : 0;

			if (currentPosition !== undefined) {
				updateMapWithGPSPosition(mapRef.current, currentPosition, currentHeading, true);
			}
		}
	}, []);

	const onFollowGPSDisabled = useCallback(() => {
		setIsFollowingGPS(false);
		setIsFollowingHeadingPrevious(isFollowingHeadingRef.current);
		setIsFollowingHeading(false);

		disableGeolocationMarkerAndHeadingFollowing();

		if (mapRef.current !== undefined) {
			const view = mapRef.current.getView();
			view.setRotation(0);
		}
	}, []);

	const onFollowHeadingEnabled = useCallback(() => {
		setIsFollowingGPS(true);
		setIsFollowingHeadingPrevious(false);
		setIsFollowingHeading(true);

		enableGeolocationMarkerAndMaybeHeadingFollowing(true);

		// When we re-enable heading following, grab the current location and heading and snap and re-orient the map to them.
		if (mapRef.current !== undefined) {
			const currentPosition = geolocation.current.getPosition();
			const currentHeading = geolocation.current.getHeading();

			// No need to check currentHeading here as it's always undefined on devices without the right hardware (e.g. laptops)
			if (currentPosition !== undefined) {
				updateMapWithGPSPosition(mapRef.current, currentPosition, currentHeading, true);
			}
		}
	}, []);

	const onFollowHeadingDisabled = useCallback(() => {
		setIsFollowingHeadingPrevious(true);
		setIsFollowingHeading(false);

		disableGeolocationHeadingMarkerFollowing();

		if (mapRef.current !== undefined) {
			const view = mapRef.current.getView();
			view.setRotation(0);
		}
	}, []);
	// ######################
	// Geolocation (End)
	// ######################

	// ######################
	// Feature Movement
	// ######################
	const [isFeatureMovementAllowed, setIsFeatureMovementAllowed] = useState(false);

	const isFeatureMovementAllowedRef = useRef<boolean>(false);
	isFeatureMovementAllowedRef.current = isFeatureMovementAllowed;

	const onFeatureMovementEnabled = useCallback(() => {
		setModifyInteractionStatus(mapRef.current, true);
		setIsFeatureMovementAllowed(true);
	}, []);

	const onFeatureMovementDisabled = useCallback(() => {
		setModifyInteractionStatus(mapRef.current, false);
		setIsFeatureMovementAllowed(false);
	}, []);

	const [updateFeature] = useUpdateFeatureMutation();
	// ######################
	// Feature Movement (End)
	// ######################

	// ######################
	// Initialise map on load
	// ######################
	useEffect(() => {
		// console.log('useEffect init');

		if (mapRef.current === undefined) {
			// console.log('making a map');

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
				view:
					currentPosition !== undefined
						? new View({ zoom: defaultZoomLevel, center: fromLonLat(currentPosition) })
						: undefined,
			});

			// ######################
			// Geolocation
			// ######################
			initialMap.addOverlay(createGeolocationMarkerOverlay(geolocationMarkerOverlayId));
			initialMap.addOverlay(createGeolocationMarkerOverlay(geolocationMarkerHeadingForegroundTriangleOvelayId));
			initialMap.addOverlay(createGeolocationMarkerOverlay(geolocationMarkerHeadingBackgroundTriangleOvelayId));

			const geolocationEventKeys = [
				geolocation.current.on(
					'change:position',
					onGeolocationChangePosition(
						initialMap,
						mapHasPositionRef,
						setMapHasPosition,
						isFollowingGPSRef,
						isFollowingHeadingRef,
						isUserMovingTheMapRef,
						geolocationHasErrorRef,
						setGeolocationHasError,
					),
				),
				geolocation.current.on(
					'error',
					onGeolocationError(initialMap, mapHasPositionRef, setMapHasPosition, setGeolocationHasError),
				),
			];
			// ######################
			// Geolocation (End)
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
					setIsFollowingHeadingPrevious(isFollowingHeadingRef.current);
					setIsFollowingHeading(false);

					disableGeolocationMarkerAndHeadingFollowing();
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

			return () => {
				// console.log('Cleanup OLMap');

				vectorLayer.current = undefined;

				unByKey(geolocationEventKeys);

				initialMap.setTarget(undefined);

				if (mapRef.current !== undefined) {
					mapRef.current.setTarget(undefined);
					mapRef.current = undefined;
				}

				setMap(undefined);
			};
		}

		// Note: basemap is not strictly needed in here because any changes to it from
		// the settings panel are done via a full page reload.
	}, [basemap, basemap_style, dispatch, navigate]);
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
					onModifyInteractionStartEnd((feature: Partial<MapaFeature>) => updateFeature(feature)),
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
					onModifyInteractionStartEnd((feature: Partial<MapaFeature>) => updateFeature(feature)),
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
					onModifyInteractionStartEnd((feature: Partial<MapaFeature>) => updateFeature(feature)),
					onModifyInteractionAddRemoveFeature,
				);
			}
		}
	}, [featuresAndSpriteSheet.geoJSON, featuresAndSpriteSheet.spriteSheet, mapRenderer, updateFeature]);
	// ######################
	// Data Layer (End)
	// ######################

	return (
		<div className="map-container">
			<div id={mapTargetElementId} />
			{mapHasPosition === false ? (
				<LocationFetchingIndicator />
			) : mapFeatureLoadingStatus === eMapFeaturesLoadingStatus.SUCCEEDED ? (
				<React.Fragment>
					<div id="centre_of_the_map"></div>

					<div id="workaround_modify_interaction_bug"></div>

					<SnapToGPSButton
						isFollowingGPS={isFollowingGPS}
						onFollowGPSEnabled={onFollowGPSEnabled}
						onFollowGPSDisabled={onFollowGPSDisabled}
					/>

					<FollowHeadingButton
						isFollowingHeading={isFollowingHeading}
						onFollowHeadingEnabled={onFollowHeadingEnabled}
						onFollowHeadingDisabled={onFollowHeadingDisabled}
					/>

					<FeatureMovementButton
						isFeatureMovementAllowed={isFeatureMovementAllowed}
						onFeatureMovementEnabled={onFeatureMovementEnabled}
						onFeatureMovementDisabled={onFeatureMovementDisabled}
					/>

					<QuickAddSymbolsControl />
				</React.Fragment>
			) : (
				<React.Fragment></React.Fragment>
			)}

			{geolocationHasError !== false && (
				<Alert severity="error" sx={{ zIndex: 30, position: 'absolute', bottom: 160, ml: 1, mr: 1 }}>
					<AlertTitle>Error determining your location</AlertTitle>
					We&lsquo;re now trying to re-establish your location. If we can&lsquo;t, please try refreshing or restarting
					the app and report it to the developer.
					<br />
					Type: {geolocationHasError.type}, Code: {geolocationHasError.code}, Message: {geolocationHasError.message}
				</Alert>
			)}
		</div>
	);
}

export default OLMap;
