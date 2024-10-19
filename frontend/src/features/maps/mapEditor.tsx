import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks/store';
import { getIntegerParamOrUndefined } from '../../app/routing/routingHelpers';
import { type MapaMap, useUpdateMapMutation } from '../../app/services/maps';
import MapForm from './mapForm';
import { selectMapById } from './mapsSlice';

function MapEditorEntrypoint() {
	const params = useParams();
	const mapId = getIntegerParamOrUndefined(params, 'mapId');

	if (mapId === undefined) {
		return <NotFound />;
	}

	return <MapEditor mapId={mapId} />;
}

interface Props {
	mapId: number;
}

function MapEditor(props: Props) {
	const { mapId } = props;

	const navigate = useNavigate();

	const map = useAppSelector((state) => selectMapById(state, mapId));

	const [updateMap, { isLoading: isUpdatingMapLoading, isSuccess: isUpdatingMapSuccessful }] = useUpdateMapMutation();

	// We need to use the useEffect approach, rather than the
	// naked if approach (below) because otherwise this will
	// call onDone(), which causes MapsManger to start to re-render
	// at the same time, which causes React to complain about
	// updating a component while another is being rendered.
	useEffect(() => {
		if (isUpdatingMapSuccessful === true) {
			navigate('/MapManager/');
		}
	}, [isUpdatingMapSuccessful, navigate]);

	// if (isUpdatingMapSuccessful === true) {
	//   navigate("/MapManager/");
	// }

	const onDoneEditing = useCallback(
		(map: MapaMap) => {
			updateMap(map);
		},
		[updateMap],
	);

	// Just in case the user loads the page directly via the URL and the UI renders before we get the API response
	if (map === undefined) {
		return null;
	}

	return <MapForm map={map} isMapSaving={isUpdatingMapLoading} onDoneEditing={onDoneEditing} />;
}

export default MapEditorEntrypoint;
