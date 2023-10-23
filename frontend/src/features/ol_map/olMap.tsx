import { MapBrowserEvent, MapEvent, View } from 'ol';
import Geolocation from 'ol/Geolocation';
import Map from 'ol/Map';
import { unByKey } from 'ol/Observable';
import { Geometry, Point } from 'ol/geom';
import { DblClickDragZoom, defaults as defaultInteractions } from 'ol/interaction';
import VectorImageLayer from 'ol/layer/VectorImage';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { Basemap, MapRenderer } from '../../app/services/auth';
import { Feature, useUpdateFeatureMutation } from '../../app/services/features';
import {
	eMapFeaturesLoadingStatus,
	getMapFeatureLoadingStatus,
	selectGeoJSONFeaturesAndSpriteSheet,
	setFeaturesAvailableForEditing,
	setMapView,
} from '../app/appSlice';
import FeatureMovementButton from './featureMovementButton';
import LocationFetchingIndicator from './locationFetchingIndicator';
import './olMap.css';
import {
	createGeolocationMarkerOverlay,
	defaultZoomLevel,
	geolocationMarkerOvelayerIdInner,
	geolocationMarkerOvelayerIdOuter,
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
import SnapToGPSButton from './snapToGPSButton';

// Inspo:
// https://taylor.callsen.me/using-openlayers-with-react-functional-components/
// https://medium.com/swlh/how-to-incorporate-openlayers-maps-into-react-65b411985744

interface Props {
	mapRenderer?: MapRenderer;
	basemap?: Basemap;
}

function OLMap(props: Props) {
	// console.log('# olMap rendering');

	const dispatch = useAppDispatch();

	const navigate = useNavigate();

	const { mapRenderer, basemap } = props;

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
		VectorImageLayer<VectorSource<Geometry>> | WebGLPointsLayer<VectorSource<Point>> | undefined
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

	const geolocationHasPositionRef = useRef<boolean>(false);
	geolocationHasPositionRef.current = mapHasPosition;

	const [isFollowingGPS, setIsFollowingGPS] = useState(true);
	const isFollowingGPSRef = useRef<boolean>(true);
	isFollowingGPSRef.current = isFollowingGPS;

	const onFollowGPSEnabled = useCallback(() => {
		setIsFollowingGPS(true);

		// When we re-enable location following, grab the current location and snap the map to it
		if (mapRef.current !== undefined) {
			const curerentPosition = geolocation.current.getPosition();
			if (curerentPosition !== undefined) {
				updateMapWithGPSPosition(mapRef.current, curerentPosition, true);
			}
		}
	}, []);
	const onFollowGPSDisabled = useCallback(() => setIsFollowingGPS(false), []);
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
			const curerentPosition = geolocation.current.getPosition();

			const initialMap = new Map({
				target: mapTargetElementId,
				interactions: defaultInteractions().extend([new DblClickDragZoom()]),
				layers: [getBasemap(basemap)],
				controls: [],
				view:
					curerentPosition !== undefined
						? new View({ zoom: defaultZoomLevel, center: fromLonLat(curerentPosition) })
						: undefined,
			});

			// ######################
			// Geolocation
			// ######################
			initialMap.addOverlay(createGeolocationMarkerOverlay(geolocationMarkerOvelayerIdOuter));
			initialMap.addOverlay(createGeolocationMarkerOverlay(geolocationMarkerOvelayerIdInner));

			const geolocationEventKeys = [
				geolocation.current.on(
					'change:position',
					onGeolocationChangePosition(initialMap, geolocationHasPositionRef, setMapHasPosition, isFollowingGPSRef),
				),
				geolocation.current.on(
					'error',
					onGeolocationError(initialMap, geolocationHasPositionRef, setMapHasPosition, setIsFollowingGPS),
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
			});

			initialMap.on('pointerdrag', () => {
				isDragging = true;
			});

			initialMap.on('moveend', (evt: MapEvent) => {
				if ((isDragging === true || isDoubleClicking === true) && geolocation.current.getTracking() === true) {
					setIsFollowingGPS(false);
				}

				isDragging = false;
				isDoubleClicking = false;

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
				onMapClick((features: Feature[]) => {
					dispatch(setFeaturesAvailableForEditing(features.map((f) => f.id)));

					if (features.length === 1) {
						navigate(`/FeatureManager/Edit/${features[0].id}`);
					} else if (features.length > 1) {
						navigate('/FeatureManager');
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
	}, [basemap, dispatch, navigate]);
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
					onModifyInteractionStartEnd((feature: Partial<Feature>) => updateFeature(feature)),
					onModifyInteractionAddRemoveFeature,
				);
			} else {
				// console.log('> manage vector layer: update VectorImageLayer layer');

				manageVectorImageLayerUpdate(
					featuresAndSpriteSheet.geoJSON,
					vectorLayer.current as VectorImageLayer<VectorSource<Geometry>>,
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
					onModifyInteractionStartEnd((feature: Partial<Feature>) => updateFeature(feature)),
					onModifyInteractionAddRemoveFeature,
				);
			} else {
				// console.log('> manage vector layer: update WebGLPointsLayer layer');

				vectorLayer.current = manageWebGLPointsLayerUpdate(
					featuresAndSpriteSheet.geoJSON,
					featuresAndSpriteSheet.spriteSheet,
					vectorLayer.current as WebGLPointsLayer<VectorSource<Point>>,
					mapRef.current,
					isFeatureMovementAllowedRef.current,
					onModifyInteractionStartEnd((feature: Partial<Feature>) => updateFeature(feature)),
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

					<FeatureMovementButton
						isFeatureMovementAllowed={isFeatureMovementAllowed}
						onFeatureMovementEnabled={onFeatureMovementEnabled}
						onFeatureMovementDisabled={onFeatureMovementDisabled}
					/>
				</React.Fragment>
			) : (
				<React.Fragment></React.Fragment>
			)}
		</div>
	);
}

export default OLMap;
