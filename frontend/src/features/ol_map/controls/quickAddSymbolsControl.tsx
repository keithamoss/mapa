import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar, Box, IconButton, styled } from '@mui/material';
import { grey } from '@mui/material/colors';
import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/store';
import { User } from '../../../app/services/auth';
import { MapaFeature, useAddFeatureToMapMutation } from '../../../app/services/features';
import { Map } from '../../../app/services/maps';
import { FeatureSchemaSymbologySymbolsValue, usePatchFeatureSchemaMutation } from '../../../app/services/schemas';
import { selectActiveMapId } from '../../app/appSlice';
import { selectUser } from '../../auth/authSlice';
import { initFeatureAtMapCentreWithKnownSchema, selectAllFeatures } from '../../features/featuresSlice';
import { selectMapsResult } from '../../maps/mapsSlice';
import { getSchemaById, updateSchemaRecentlyUsedSymbols } from '../../schemas/schemaHelpers';
import { selectAllFeatureSchemas } from '../../schemas/schemasSlice';
import {
	getQuickAddModeOrDefault,
	getQuickAddSymbolCountOrDefault,
	getQuickAddSymbols,
} from '../../settings/quickAddSymbolsHelpers';
import {
	defaultSymbolSizeForFormFields,
	getAppDefaultSymbologyConfig,
	getFontAwesomeIconForSymbolPreview,
} from '../../symbology/symbologyHelpers';

const StyledBox = styled(Box)(({ theme }) => ({
	position: 'absolute',
	top: theme.spacing(14),
	right: theme.spacing(2),
	width: 50,
}));

function QuickAddSymbolsControlEntrypoint() {
	const activeMapId = useAppSelector((state) => selectActiveMapId(state));
	const maps = useAppSelector((state) => selectMapsResult(state));
	const activeMap = activeMapId !== undefined && maps.data !== undefined ? maps.data.entities[activeMapId] : undefined;

	const user = useAppSelector(selectUser);

	const features = useAppSelector(selectAllFeatures);

	if (activeMap === undefined) {
		return null;
	}

	if (user === null) {
		return null;
	}

	if (features.length === 0) {
		return null;
	}

	return <QuickAddSymbolsControl map={activeMap} user={user} features={features} />;
}

interface Props {
	map: Map;
	user: User;
	features: MapaFeature[];
}

function QuickAddSymbolsControl(props: Props) {
	const { map, user, features } = props;

	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const schemas = useAppSelector(selectAllFeatureSchemas);

	const [addFeatureToMap] = useAddFeatureToMapMutation();
	const [patchSchema] = usePatchFeatureSchemaMutation();

	const onClickSettings = useCallback(() => navigate('QuickAddSymbolsSettingsManager'), [navigate]);

	const onQuickAdd = useCallback(
		(symbol: FeatureSchemaSymbologySymbolsValue, schemaId: number) => () => {
			const featureBase = dispatch(initFeatureAtMapCentreWithKnownSchema(map.id, schemaId));

			if (featureBase !== undefined) {
				const feature = {
					...featureBase,
					symbol_id: symbol.id,
				};
				// console.log('feature', feature);

				addFeatureToMap(feature);

				const recentlyUsedSymbols = updateSchemaRecentlyUsedSymbols(feature, getSchemaById(schemaId, schemas), map.id);

				if (recentlyUsedSymbols !== undefined) {
					// console.log('recentlyUsedSymbols', recentlyUsedSymbols);
					patchSchema({
						id: schemaId,
						recently_used_symbols: recentlyUsedSymbols,
					});
				}
			}
		},
		[addFeatureToMap, dispatch, map.id, patchSchema, schemas],
	);

	const symbolsToShow = getQuickAddSymbols(
		getQuickAddModeOrDefault(user.settings),
		getQuickAddSymbolCountOrDefault(user.settings),
		features,
		schemas,
		map.id,
	);
	console.log('symbolsToShow', symbolsToShow);

	return (
		<StyledBox>
			<IconButton onClick={onClickSettings} size="small">
				<Avatar sx={{ bgcolor: grey[400] }}>
					<SettingsIcon />
				</Avatar>
			</IconButton>

			{symbolsToShow.map((v) => (
				<IconButton key={`${v.schema.id}.${v.symbol.id}`} onClick={onQuickAdd(v.symbol, v.schema.id)} size="small">
					<Avatar sx={{ bgcolor: grey[400] }}>
						{getFontAwesomeIconForSymbolPreview(
							{
								...getAppDefaultSymbologyConfig(),
								...map.default_symbology,
								...v.schema.default_symbology,
								...v.symbol.props,
							},
							{
								size: defaultSymbolSizeForFormFields,
							},
						)}
					</Avatar>
				</IconButton>
			))}
		</StyledBox>
	);
}

export default memo(QuickAddSymbolsControlEntrypoint);
