import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks/store';
import { getIntegerParamOrUndefined } from '../../app/routing/routingHelpers';
import { MapaFeature, useUpdateFeatureMutation } from '../../app/services/features';
import { selectActiveMapId } from '../app/appSlice';
import FeatureForm from './featureForm';
import { selectFeatureById } from './featuresSlice';

function FeatureEditorEntrypoint() {
	const params = useParams();
	const featureId = getIntegerParamOrUndefined(params, 'featureId');

	const mapId = useAppSelector(selectActiveMapId);

	if (featureId === undefined || mapId === undefined) {
		return <NotFound />;
	}

	return <FeatureEditorEntrypointLayer2 mapId={mapId} featureId={featureId} />;
}

function FeatureEditorEntrypointLayer2(props: { mapId: number; featureId: number }) {
	const { mapId, featureId } = props;

	const feature = useAppSelector((state) => selectFeatureById(state, featureId));

	if (feature !== undefined) {
		return <FeatureEditor mapId={mapId} feature={feature} />;
	}

	// Just in case the user loads the page directly via the URL and the UI renders before we get the API response
	return null;
}

interface Props {
	mapId: number;
	feature: MapaFeature;
}

function FeatureEditor(props: Props) {
	const { mapId, feature } = props;

	const navigate = useNavigate();

	const [updateFeature, { isLoading: isUpdatingFeatureLoading, isSuccess: isUpdatingFeatureSuccessful }] =
		useUpdateFeatureMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isUpdatingFeatureSuccessful === true) {
			navigate('/');
		}
	}, [isUpdatingFeatureSuccessful, navigate]);

	const onDoneEditing = useCallback(
		(feature: MapaFeature) => {
			updateFeature(feature);
		},
		[updateFeature],
	);

	return (
		<FeatureForm
			mapId={mapId}
			feature={feature}
			isFeatureSaving={isUpdatingFeatureLoading}
			onDoneEditing={onDoneEditing}
		/>
	);
}

export default FeatureEditorEntrypoint;
