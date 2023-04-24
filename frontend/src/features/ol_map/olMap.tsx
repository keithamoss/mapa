import { Map, MapEvent, View } from "ol";
import { default as OLFeature } from "ol/Feature";
import { Geometry, Point } from "ol/geom";
import { Modify } from "ol/interaction.js";
import { ModifyEvent } from "ol/interaction/Modify";
import MapboxVector from "ol/layer/MapboxVector";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";

import { StyleFunction } from "ol/style/Style";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import { usePosition } from "../../app/hooks/usePosition";
import { useUnmount } from "../../app/hooks/useUnmount";
import {
  Feature,
  useGetFeaturesForMapQuery,
  useUpdateFeatureMutation,
} from "../../app/services/features";
import { OLMapView, setMapView, setSelectedFeatures } from "../app/appSlice";
import { selectMapById } from "../maps/mapsSlice";
import { selectAllFeatureSchemas } from "../schemas/schemasSlice";
import LocationFetchingIndicator from "./locationFetchingIndicator";
import {
  createDataVectorLayer,
  createVectorLayerForUserPosition,
  getPointGeoJSONFromCoordinates,
  isDataVectorLayer,
  updateDataVectorLayer,
  updateVectorLayerForUserPosition,
} from "./olLayerManager";
import "./olMap.css";
import { olStyleFunction } from "./olStylingManager";
import SnapToGPSButton from "./snapToGPSButton";

// Inspo:
// https://taylor.callsen.me/using-openlayers-with-react-functional-components/
// https://medium.com/swlh/how-to-incorporate-openlayers-maps-into-react-65b411985744

interface Props {
  mapId: number;
}

const defaultZoomLevel = 18;
const mapTargetElementId = "map";

function OLMap(props: Props) {
  console.log("### OLMap ###");

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const { mapId } = props;

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

  const [isWatchingGPS] = useState(true);

  const [isFollowingGPS, setIsFollowingGPS] = useState(true);

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

  // R1 when features are retrieved
  const { data: features } = useGetFeaturesForMapQuery(mapId);
  // Filter out features that either have no schema (how does that even happen??) or that aren't part of the available scheams for this map (why??)
  const filteredFeatures = Object.values(features || []).filter(
    (feature) =>
      feature.schema_id === null ||
      map?.hidden_schema_ids.includes(feature.schema_id) === false
  );

  let vectorLayer = useRef<VectorLayer<VectorSource<Geometry>> | undefined>(
    undefined
  );

  let vectorLayerUserPosition = useRef<
    VectorLayer<VectorSource<Geometry>> | undefined
  >(undefined);

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
  const {
    latitude,
    longitude /*, speed, timestamp, accuracy, heading, error*/,
  } = usePosition(isWatchingGPS);

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
            styleUrl: "mapbox://styles/keithmoss/clgu2ornp001j01r76h3o6j3g",
            accessToken: process.env.REACT_APP_MAPBOX_API_KEY,
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
      initialMap.on("pointerdrag", onPointerDrag);

      const onMoveStart = () => {
        isDragging = false;
      };
      initialMap.on("movestart", onMoveStart);

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
          // into a useRef() as well, but meh.
          setIsFollowingGPS(false);
        }
      };
      initialMap.on("moveend", onMoveEnd);

      initialMap.on("click", (evt) => {
        const features: Feature[] = [];
        initialMap.forEachFeatureAtPixel(
          evt.pixel,
          (feature, layer) => {
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
          navigate("/FeatureManager");
        }
      });

      initialMap.on("dblclick", (e) => {
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
    if (
      isFollowingGPS === true &&
      latitude !== undefined &&
      longitude !== undefined
    ) {
      onViewChangeAndUpdateMap({
        center: fromLonLat([longitude, latitude]),
        zoom: defaultZoomLevel,
      });
    }
  }, [isFollowingGPS, latitude, longitude, onViewChangeAndUpdateMap]);

  // R6
  // Manage the vector layer with the user's features
  useEffect(() => {
    // console.log("manage vector layer: start");
    if (
      olMapRef.current !== undefined &&
      map !== undefined &&
      features !== undefined
    ) {
      const styleFunction = (feature: OLFeature, resolution: number) =>
        olStyleFunction(
          feature,
          resolution,
          map.default_symbology,
          featureSchemas
        );

      if (vectorLayer.current === undefined) {
        // console.log("manage vector layer: create");
        vectorLayer.current = createDataVectorLayer(
          filteredFeatures,
          styleFunction as StyleFunction
        );
        olMapRef.current.addLayer(vectorLayer.current);

        const modify = new Modify({
          hitDetection: vectorLayer.current,
          source: vectorLayer.current.getSource() || undefined,
        });

        modify.on(["modifystart", "modifyend"], (evt) => {
          const target = document.getElementById(mapTargetElementId);
          if (target !== null) {
            const e = evt as ModifyEvent;
            target.style.cursor =
              e.type === "modifystart" ? "grabbing" : "pointer";

            if (e.type === "modifyend") {
              e.features.forEach((feature) => {
                const point = feature.getGeometry() as Point;
                if (point.getType() === "Point") {
                  const { id, geom_type, map_id } =
                    feature.getProperties() as Feature;
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
        });

        const overlaySource = modify.getOverlay().getSource();
        overlaySource.on(
          ["addfeature", "removefeature"],
          (evt: VectorSourceEvent) => {
            const target = document.getElementById(mapTargetElementId);
            if (target !== null) {
              target.style.cursor = evt.type === "addfeature" ? "pointer" : "";
            }
          }
        );

        olMapRef.current.addInteraction(modify);
      } else {
        // console.log("manage vector layer: update");
        updateDataVectorLayer(filteredFeatures, vectorLayer.current);
        vectorLayer.current.setStyle(styleFunction as StyleFunction);
      }
    }
    // NOTE: React is complaining about olMapRef.current being unnecesary here because it won't re-render the component,
    // but that's OK because we don't need it to re - render the component when olMapRef.current changes - we just need
    // this to run as part of this re-rendering of the component and have it react to olMap now being set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [olMapRef.current, map, features, featureSchemas]);

  // R7
  // Manage the vector layer with the user's current position
  useEffect(() => {
    if (
      olMapRef.current !== undefined &&
      latitude !== undefined &&
      longitude !== undefined
    ) {
      if (vectorLayerUserPosition.current === undefined) {
        vectorLayerUserPosition.current = createVectorLayerForUserPosition(
          latitude,
          longitude
        );
        olMapRef.current.addLayer(vectorLayerUserPosition.current);
      } else {
        updateVectorLayerForUserPosition(
          latitude,
          longitude,
          vectorLayerUserPosition.current
        );
      }
    }
    // See notes in above hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [olMapRef.current, latitude, longitude]);

  return (
    <div className="map-container">
      <div id={mapTargetElementId} />
      {olMapRef.current === undefined && <LocationFetchingIndicator />}

      {olMapRef.current !== undefined && (
        <React.Fragment>
          <div id="centre_of_the_map"></div>

          <SnapToGPSButton
            isFollowingGPS={isFollowingGPS}
            onFollowGPSEnabled={onFollowGPSEnabled}
            onFollowGPSDisabled={onFollowGPSDisabled}
          />
        </React.Fragment>
      )}
    </div>
  );
}

export default OLMap;
