import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Box, Button, IconButton, Toolbar } from '@mui/material';
import { View } from 'ol';
import Map from 'ol/Map';
import Attribution from 'ol/control/Attribution';
import type { Coordinate } from 'ol/coordinate';
import { DblClickDragZoom, MouseWheelZoom, defaults as defaultInteractions } from 'ol/interaction';
import 'ol/ol.css';
import { fromLonLat, toLonLat } from 'ol/proj';
import { useCallback, useRef, useState } from 'react';
import { Basemap, BasemapStyle } from '../../app/services/auth';
import { DialogWithTransition } from '../../app/ui/dialog';
import '../ol_map/olMapCore.css';
import { getBasemap } from '../ol_map/olMapHelpers';
import './mapStartingLocationEditor.css';
import {
	defaultStaringLocationEditorCoordinates,
	defaultStaringLocationEditorZoomLevel,
} from './mapStartingLocationEditorHelpers';

export const mapTargetElementId = 'map-choose-starting-location';

interface Props {
	centre?: Coordinate;
	zoom?: number;
	onDone: (centre: Coordinate | undefined, zoom: number) => void;
	onClose: () => void;
}

export default function MapStartingLocationEditor(props: Props) {
	const { centre, zoom, onDone, onClose } = props;

	// ######################
	// OpenLayers Map
	// ######################
	const [map, setMap] = useState<Map>();

	// Create state ref that can be accessed in OpenLayers callback functions et cetera
	// https://stackoverflow.com/a/60643670
	const mapRef = useRef<Map>();
	mapRef.current = map;

	// The trick here - and the thing we spent ages beating our heads against - is to only init the map when the DialogWithTransition it's in has completely finished rendering and is shown.
	// If we don't do this, we get a lot of weird and subtle errors where the `map` variable points to earlier
	// copies of the map that were init'd while the DialogWithTransition was still setting itself up.
	const makeMap = useCallback(() => {
		const map = new Map({
			target: mapTargetElementId,
			interactions: defaultInteractions({ mouseWheelZoom: false }).extend([
				new DblClickDragZoom(),
				new MouseWheelZoom(),
			]),
			layers: [getBasemap(Basemap.MapboxVectorTile, BasemapStyle.Monochrome)],
			controls: [new Attribution({ collapsible: false })],
			view: new View({
				zoom: zoom || defaultStaringLocationEditorZoomLevel,
				center: fromLonLat(centre || defaultStaringLocationEditorCoordinates),
			}),
		});

		setMap(map);
		mapRef.current = map;

		return () => {
			map.setTarget(undefined);

			if (mapRef.current !== undefined) {
				mapRef.current.setTarget(undefined);
				mapRef.current = undefined;
			}

			setMap(undefined);
		};
	}, [centre, zoom]);
	// ######################
	// OpenLayers Map (End)
	// ######################

	// ######################
	// On Save Controls
	// ######################
	const onClickSaveZoom = useCallback(() => {
		if (mapRef.current !== undefined) {
			const zoom = mapRef.current.getView()?.getZoom();

			if (zoom !== undefined) {
				onDone(undefined, zoom);
			}
		}
	}, [onDone]);

	const onClickSaveZoomAndCentre = useCallback(() => {
		if (mapRef.current !== undefined) {
			const view = mapRef.current.getView();
			const centre = view.getCenter();
			const zoom = view.getZoom();

			if (centre !== undefined && zoom !== undefined) {
				onDone(toLonLat(centre), zoom);
			}
		}
	}, [onDone]);
	// ######################
	// On Save Controls (End)
	// ######################

	return (
		<DialogWithTransition
			onClose={onClose}
			transitionProps={{
				addEndListener: makeMap,
			}}
		>
			<AppBar color="secondary" sx={{ position: 'sticky' }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose}>
						<CloseIcon />
					</IconButton>

					<Button color="inherit" onClick={onClickSaveZoom}>
						Set Zoom Level
					</Button>

					<Button color="inherit" onClick={onClickSaveZoomAndCentre}>
						Set Zoom & Centre
					</Button>
				</Toolbar>
			</AppBar>

			<Box>
				<div className="map-choose-starting-location-container">
					<div id={mapTargetElementId} />
				</div>
			</Box>
		</DialogWithTransition>
	);
}
