import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { NewFeature, useAddFeatureToMapMutation } from '../../app/services/features';
import { FeatureSchema, usePatchFeatureSchemaMutation } from '../../app/services/schemas';
import { selectActiveMapId } from '../app/appSlice';
import FeatureForm from './featureForm';

interface LocationState {
	feature?: NewFeature;
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
	feature: NewFeature;
}

function FeatureCreator(props: Props) {
	const { mapId, feature } = props;

	const navigate = useNavigate();

	const [addFeatureToMap, { isSuccess: isAddingFeatureSuccessful, isUninitialized: isAddingFeatureUninitialised }] =
		useAddFeatureToMapMutation();

	const [patchSchema, { isSuccess: isPatchingSchemaSuccessful }] = usePatchFeatureSchemaMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (
			(isAddingFeatureSuccessful === true && isAddingFeatureUninitialised === false) ||
			isPatchingSchemaSuccessful === true
		) {
			navigate('/');
		}
	}, [isAddingFeatureSuccessful, isAddingFeatureUninitialised, isPatchingSchemaSuccessful, navigate]);

	const onDoneAdding = useCallback(
		(feature: NewFeature, schema: FeatureSchema | undefined) => {
			addFeatureToMap(feature);

			if (schema !== undefined && feature.symbol_id !== null) {
				const recentlyUsedSymbols = { ...schema.recently_used_symbols };

				if (recentlyUsedSymbols[mapId] === undefined) {
					recentlyUsedSymbols[mapId] = [];
				}

				recentlyUsedSymbols[mapId] = [
					feature.symbol_id,
					...recentlyUsedSymbols[mapId].filter((id) => id != feature.symbol_id),
				].slice(0, 3);

				patchSchema({
					id: schema.id,
					recently_used_symbols: recentlyUsedSymbols,
				});
			}
		},
		[addFeatureToMap, mapId, patchSchema],
	);

	return <FeatureForm mapId={mapId} feature={feature} onDoneAdding={onDoneAdding} />;
}

export default FeatureCreatorEntrypoint;
