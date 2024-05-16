import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { NewMapaFeature, useAddFeatureToMapMutation } from '../../app/services/features';
import { FeatureSchema, usePatchFeatureSchemaMutation } from '../../app/services/schemas';
import { selectActiveMapId } from '../app/appSlice';
import { updateSchemaRecentlyUsedSymbols } from '../schemas/schemaHelpers';
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
		(feature: NewMapaFeature, schema: FeatureSchema | undefined) => {
			addFeatureToMap(feature);

			const recentlyUsedSymbols = updateSchemaRecentlyUsedSymbols(feature, schema, mapId);
			if (schema !== undefined && recentlyUsedSymbols !== undefined) {
				patchSchema({
					id: schema.id,
					recently_used_symbols: recentlyUsedSymbols,
				});
			}
		},
		[addFeatureToMap, mapId, patchSchema],
	);

	return (
		<FeatureForm mapId={mapId} feature={feature} isFeatureSaving={isAddingFeatureLoading} onDoneAdding={onDoneAdding} />
	);
}

export default FeatureCreatorEntrypoint;
