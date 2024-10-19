import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks/store';
import { getIntegerParamOrUndefined } from '../../app/routing/routingHelpers';
import { type Map, useUpdateMapMutation } from '../../app/services/maps';
import type { SymbologyProps } from '../../app/services/schemas';
import SymbologyFieldEditor from '../symbology/symbologyFieldEditor';
import { selectMapById } from './mapsSlice';

function MapHeroIconEditorEntrypoint() {
	const params = useParams();
	const mapId = getIntegerParamOrUndefined(params, 'mapId');

	if (mapId === undefined) {
		return <NotFound />;
	}

	return <MapHeroIconEditorEntrypointLayer2 mapId={mapId} />;
}

function MapHeroIconEditorEntrypointLayer2(props: { mapId: number }) {
	const map = useAppSelector((state) => selectMapById(state, props.mapId));

	// Just in case the user loads the page directly via the URL and the UI renders before we get the API response
	if (map === undefined) {
		return <NotFound />;
	}

	return <MapHeroIconEditor map={map} />;
}

interface Props {
	map: Map;
}

function MapHeroIconEditor(props: Props) {
	const { map } = props;

	const navigate = useNavigate();

	const [updateMap, { isLoading: isUpdatingMapLoading, isSuccess: isUpdatingMapSuccessful }] = useUpdateMapMutation();

	useEffect(() => {
		if (isUpdatingMapSuccessful === true) {
			navigate('/MapManager/');
		}
	}, [isUpdatingMapSuccessful, navigate]);

	const onDoneSettingMapHeroIcon = useCallback(
		(symbolField: SymbologyProps) => {
			updateMap({ ...map, hero_icon: symbolField });
		},
		[map, updateMap],
	);

	const onCancelSettingMapHeroIcon = useCallback(() => {
		navigate('/MapManager/');
	}, [navigate]);

	return (
		<SymbologyFieldEditor
			symbol={map.hero_icon || undefined}
			isSaving={isUpdatingMapLoading}
			onDone={onDoneSettingMapHeroIcon}
			onCancel={onCancelSettingMapHeroIcon}
			nameFieldRequired={false}
			iconFieldRequired={true}
		/>
	);
}

export default MapHeroIconEditorEntrypoint;
