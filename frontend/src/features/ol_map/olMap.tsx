/* eslint-disable no-console */
import { Map, MapEvent, View } from 'ol';
import { Geometry, Point } from 'ol/geom';
import { ModifyEvent } from 'ol/interaction/Modify';
import MapboxVector from 'ol/layer/MapboxVector';
import VectorLayer from 'ol/layer/Vector';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';

import BaseEvent from 'ol/events/Event';
import VectorImageLayer from 'ol/layer/VectorImage';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { usePosition } from '../../app/hooks/usePosition';
import { useUnmount } from '../../app/hooks/useUnmount';
import { MapRenderer } from '../../app/services/auth';
import { Feature, useGetFeaturesForMapQuery, useUpdateFeatureMutation } from '../../app/services/features';
import { OLMapView, getFilteredFeatureIds, setMapView, setSelectedFeatures } from '../app/appSlice';
import { selectMapById } from '../maps/mapsSlice';
import { selectAllFeatureSchemas } from '../schemas/schemasSlice';
import FeatureMovementButton from './featureMovementButton';
import LocationFetchingIndicator from './locationFetchingIndicator';
import {
	convertFeaturesToGeoJSON,
	createVectorLayerForUserPosition,
	geoJSONFeatures,
	getPointGeoJSONFromCoordinates,
	isDataVectorLayer,
	updateVectorLayerForUserPosition,
} from './olLayerManager';
import './olMap.css';
import { manageVectorImageLayerCreation, manageVectorImageLayerUpdate } from './olVectorImageLayerManager';
import {
	getNextLayerVersion,
	manageWebGLPointsLayerCreation,
	manageWebGLPointsLayerUpdate,
} from './olWebGLPointsLayerManager';
import SnapToGPSButton from './snapToGPSButton';

// Inspo:
// https://taylor.callsen.me/using-openlayers-with-react-functional-components/
// https://medium.com/swlh/how-to-incorporate-openlayers-maps-into-react-65b411985744

interface Props {
	mapId: number;
	mapRenderer?: MapRenderer;
}

const defaultZoomLevel = 18;
const mapTargetElementId = 'map';

const getFeatures = (
	filteredFeatureIds: number[],
	features?: {
		[key: number]: Feature;
	}
) => {
	if (features === undefined) {
		return [];
	}

	if (filteredFeatureIds.length === 0) {
		return Object.values(features);
	}

	return Object.values(features).filter((f) => filteredFeatureIds.includes(f.id));
};

function OLMap(props: Props) {
	const navigate = useNavigate();

	const dispatch = useAppDispatch();

	const filteredFeatureIds = useAppSelector(getFilteredFeatureIds);

	const { mapId, mapRenderer } = props;

	const map = useAppSelector((state) => selectMapById(state, mapId));

	const [view, setView] = useState<Partial<OLMapView>>();

	const onViewChange = useCallback(
		(newview: Partial<OLMapView>) => {
			setView(newview);
			dispatch(setMapView(newview));
		},
		[setView, dispatch]
	);

	const onViewChangeAndUpdateMap = useCallback(
		(newview: Partial<OLMapView>) => {
			onViewChange(newview);

			if (olMapRef.current !== undefined) {
				olMapRef.current.setView(new View(newview));
			}
		},
		[onViewChange]
	);

	const [isFeatureMovementAllowed, setIsFeatureMovementAllowed] = useState(false);

	const onFeatureMovementEnabled = useCallback(() => {
		setIsFeatureMovementAllowed(true);
	}, []);

	const onFeatureMovementDisabled = useCallback(() => {
		setIsFeatureMovementAllowed(false);
	}, []);

	const [isWatchingGPS] = useState(true);

	const [isFollowingGPS, setIsFollowingGPS] = useState(true);

	const [layerVersions, setLayerVersions] = useState<number[]>([]);

	const [layersReadyForRendering, setLayersReadyForRendering] = useState<{
		[key: number]: boolean;
	}>({});

	const onFollowGPSEnabled = useCallback(() => {
		setIsFollowingGPS(true);
	}, []);

	const onFollowGPSDisabled = useCallback(() => {
		setIsFollowingGPS(false);
	}, []);

	const olMapRef = useRef<Map>();

	const [
		updateFeature,
		// {
		// isSuccess: isUpdatingFeatureSuccessful,
		// isLoading: isUpdatingFeatureLoading,
		// },
	] = useUpdateFeatureMutation();

	const onModifyInteractionStartEnd = useMemo(
		() => (evt: BaseEvent | Event) => {
			const target = document.getElementById(mapTargetElementId);

			if (target !== null) {
				const e = evt as ModifyEvent;
				target.style.cursor = e.type === 'modifystart' ? 'grabbing' : 'pointer';

				if (e.type === 'modifyend') {
					e.features.forEach((feature) => {
						const point = feature.getGeometry() as Point;
						if (point.getType() === 'Point') {
							const { id, geom_type, map_id } = feature.getProperties() as Feature;
							updateFeature({
								id,
								geom: getPointGeoJSONFromCoordinates(point),
								geom_type,
								map_id,
							});
						}
					});
				}
			}
		},
		[updateFeature]
	);

	const onModifyInteractionAddRemoveFeature = useMemo(
		() => (evt: VectorSourceEvent) => {
			const target = document.getElementById(mapTargetElementId);
			if (target !== null) {
				target.style.cursor = evt.type === 'addfeature' ? 'pointer' : '';
			}
		},
		[]
	);

	// R1 when features are retrieved
	const { data: features } = useGetFeaturesForMapQuery(mapId);
	const mapFeatures = useMemo(() => getFeatures(filteredFeatureIds, features), [features, filteredFeatureIds]);

	const vectorLayer = useRef<
		VectorImageLayer<VectorSource<Geometry>> | WebGLPointsLayer<VectorSource<Point>> | undefined
	>(undefined);

	const vectorLayerUserPosition = useRef<VectorLayer<VectorSource<Geometry>> | undefined>(undefined);

	// R2 when schemas load
	const featureSchemas = useAppSelector(selectAllFeatureSchemas);

	useUnmount(() => {
		// console.log("useUnmount");
		if (olMapRef.current !== undefined) {
			// console.log("useUnmount: destroy");
			olMapRef.current.setTarget(undefined);
			olMapRef.current = undefined;
			vectorLayer.current = undefined;
			vectorLayerUserPosition.current = undefined;
		}
	});

	// R3
	// Handle fetching the user's position and keeping it up-to-date as they move
	const { latitude, longitude /*, speed, timestamp, accuracy, heading, error*/ } = usePosition(isWatchingGPS);

	// R4
	// Handle creating the map when the component mounts for the first time
	useEffect(() => {
		// console.log("map use effect: init");

		if (view === undefined) {
			return;
		}

		if (olMapRef.current === undefined) {
			// console.log("map use effect: create map", view);
			const initialMap = new Map({
				target: mapTargetElementId,
				layers: [
					new MapboxVector({
						styleUrl: 'mapbox://styles/keithmoss/clgu2ornp001j01r76h3o6j3g',
						accessToken: import.meta.env.VITE_MAPBOX_API_KEY,
					}),
				],
				view: new View(view),
				controls: [],
			});

			// Ref: https://gis.stackexchange.com/a/378877
			let isDragging = false;

			const onPointerDrag = () => {
				isDragging = true;
			};
			initialMap.on('pointerdrag', onPointerDrag);

			const onMoveStart = () => {
				isDragging = false;
			};
			initialMap.on('movestart', onMoveStart);

			const onMoveEnd = (e: MapEvent) => {
				// @TODO This causes the component to re-render on map creation because it triggers a change to the view object for the shallow equality check that React does
				const view = e.map.getView();
				onViewChange({
					center: view.getCenter(),
					zoom: view.getZoom(),
					resolution: view.getResolution(),
				});

				// User interaction to move the map needs to turn off GPS position tracking
				if (isDragging === true) {
					// @TODO This is called every time the user drags
					// because isWatchingGPS is stuck on the value it
					// had when this function was created.
					// We could maybe fixed it put putting isWatchingGPS
					// into a useRef() as well, but meh because React handles
					// dealing with multiple of the same setFoobar() calls
					// in a row.
					setIsFollowingGPS(false);
				}
			};
			initialMap.on('moveend', onMoveEnd);

			initialMap.on('click', (evt) => {
				const features: Feature[] = [];
				initialMap.forEachFeatureAtPixel(
					evt.pixel,
					(feature) => {
						features.push(feature.getProperties() as Feature);
					},
					{
						layerFilter: (layer) => isDataVectorLayer(layer),
						hitTolerance: 5,
					}
				);

				dispatch(setSelectedFeatures(features.map((f) => f.id)));

				if (features.length === 1) {
					navigate(`/FeatureManager/Edit/${features[0].id}`);
				} else if (features.length > 1) {
					navigate('/FeatureManager');
				}
			});

			initialMap.on('dblclick', (e) => {
				e.preventDefault();

				const view = e.map.getView();
				onViewChangeAndUpdateMap({
					center: e.coordinate,
					zoom: view.getZoom(),
				});

				return false;
			});

			olMapRef.current = initialMap;
		}
		// Note: It's seems to be OK to ignore other
		// props here because we deliberately only want
		// this to run once to init the map.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onViewChange, view]);

	// R5
	// When the user's GPS is set to watch, we need to
	// update the map position whenever they move.
	useEffect(() => {
		if (isFollowingGPS === true && latitude !== undefined && longitude !== undefined) {
			onViewChangeAndUpdateMap({
				center: fromLonLat([longitude, latitude]),
				zoom: defaultZoomLevel,
			});
		}
	}, [isFollowingGPS, latitude, longitude, onViewChangeAndUpdateMap]);

	// R6
	// Create the user's GeoJSON features and begin the sprite sheet generation process
	useEffect(() => {
		console.log('manage vector layer: start');

		if (olMapRef.current !== undefined && mapFeatures !== undefined) {
			console.log('manage vector layer: create features');

			const layerVersion = getNextLayerVersion(layerVersions);
			setLayerVersions((prevState) => [...prevState, layerVersion]);

			geoJSONFeatures.features = convertFeaturesToGeoJSON(
				mapFeatures,
				map?.default_symbology || null,
				featureSchemas,
				setLayersReadyForRendering,
				layerVersion,
				mapRenderer
			);

			// We can create VectorImageLayers straight away
			if (mapRenderer === MapRenderer.VectorImageLayer && vectorLayer.current === undefined) {
				console.log('manage vector layer: create VectorImageLayer');

				vectorLayer.current = manageVectorImageLayerCreation(
					olMapRef.current,
					isFeatureMovementAllowed,
					onModifyInteractionStartEnd,
					onModifyInteractionAddRemoveFeature
				);
			}
		}
		// layerVersions needs to stay out of here to avoid an endless loop of rendering
		// olMapRef.current needs to be here so we actually create the map when the features API returns a response
		// isFeatureMovementAllowed isn't needed here because there's a separate useEffect for that
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [olMapRef.current, featureSchemas, map?.default_symbology, mapFeatures]);

	// Handle updating the vector layer styles and features when the sprite sheet generation process has finished
	useEffect(() => {
		if (olMapRef.current !== undefined) {
			if (mapRenderer === MapRenderer.VectorImageLayer) {
				console.log('manage vector layer: update VectorImageLayer layer');

				manageVectorImageLayerUpdate(vectorLayer.current as VectorImageLayer<VectorSource<Geometry>>);
			} else {
				const latestVersion = Math.max(...layerVersions);

				if (layersReadyForRendering[latestVersion] === true) {
					if (vectorLayer.current === undefined) {
						console.log('manage vector layer: create WebGLPointsLayer');

						vectorLayer.current = manageWebGLPointsLayerCreation(
							olMapRef.current,
							isFeatureMovementAllowed,
							onModifyInteractionStartEnd,
							onModifyInteractionAddRemoveFeature
						);
					} else {
						console.log('manage vector layer: update WebGLPointsLayer');

						vectorLayer.current = manageWebGLPointsLayerUpdate(
							vectorLayer.current as WebGLPointsLayer<VectorSource<Point>>,
							olMapRef.current,
							isFeatureMovementAllowed,
							onModifyInteractionStartEnd,
							onModifyInteractionAddRemoveFeature
						);
					}
				}
			}
		}
		// isFeatureMovementAllowed isn't needed here because there's a separate useEffect for that
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		layerVersions,
		layersReadyForRendering,
		mapRenderer,
		onModifyInteractionAddRemoveFeature,
		onModifyInteractionStartEnd,
	]);

	// R7
	// Manage the vector layer with the user's current position
	useEffect(() => {
		if (olMapRef.current !== undefined && latitude !== undefined && longitude !== undefined) {
			if (vectorLayerUserPosition.current === undefined) {
				vectorLayerUserPosition.current = createVectorLayerForUserPosition(latitude, longitude);
				olMapRef.current.addLayer(vectorLayerUserPosition.current);
			} else {
				updateVectorLayerForUserPosition(latitude, longitude, vectorLayerUserPosition.current);
			}
		}
		// See notes in above hook
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [olMapRef.current, latitude, longitude]);

	// R7=8
	// Manage enabling/disabling the movement of features
	useEffect(() => {
		if (olMapRef.current !== undefined) {
			olMapRef.current.getInteractions().forEach((interaction) => {
				if (interaction.constructor.name === 'Modify') {
					interaction.setActive(isFeatureMovementAllowed);
				}
			});
		}
	}, [isFeatureMovementAllowed]);

	return (
		<div className="map-container">
			<div id={mapTargetElementId} />
			{olMapRef.current === undefined && <LocationFetchingIndicator />}

			{olMapRef.current !== undefined && (
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
			)}
		</div>
	);
}

export default OLMap;
