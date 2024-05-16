import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { NewMapaFeature, useAddFeatureToMapMutation } from '../../app/services/features';
import { selectActiveMapId } from '../app/appSlice';
import FeatureForm from './featureForm';

interface LocationState {
	feature?: NewMapaFeature;
}

function FeatureCreatorEntrypoint() {
	const mapId = useAppSelector(selectActiveMapId);

	const navigate = useNavigate();

	const location = useLocation();
	const feature = (location.state as LocationState)?.feature;

	// Just in case the user loads the page directly via the URL
	useEffect(() => {
		if (mapId === undefined || feature === undefined) {
			navigate('/');
		}
	}, [feature, mapId, navigate]);

	if (mapId === undefined || feature === undefined) {
		return null;
	}

	return <FeatureCreator mapId={mapId} feature={feature} />;
}

interface Props {
	mapId: number;
	feature: NewMapaFeature;
}

function FeatureCreator(props: Props) {
	const { mapId, feature } = props;

	const navigate = useNavigate();

	const [
		addFeatureToMap,
		{
			isLoading: isAddingFeatureLoading,
			isSuccess: isAddingFeatureSuccessful,
			isUninitialized: isAddingFeatureUninitialised,
		},
	] = useAddFeatureToMapMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isAddingFeatureSuccessful === true && isAddingFeatureUninitialised === false) {
			navigate('/');
		}
	}, [isAddingFeatureSuccessful, isAddingFeatureUninitialised, navigate]);

	const onDoneAdding = useCallback(
		(feature: NewMapaFeature) => {
			addFeatureToMap(feature);
		},
		[addFeatureToMap],
	);

	return (
		<FeatureForm mapId={mapId} feature={feature} isFeatureSaving={isAddingFeatureLoading} onDoneAdding={onDoneAdding} />
	);
}

export default FeatureCreatorEntrypoint;
