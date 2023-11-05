import { AddLocationAlt } from '@mui/icons-material';
import SpeedDial from '@mui/material/SpeedDial';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks/store';
import { initFeatureFromMapCentre } from '../features/featuresSlice';

interface Props {
	mapId?: number;
}

export default function AddFeatureButton(props: Props) {
	const navigate = useNavigate();

	const dispatch = useAppDispatch();

	const { mapId } = props;

	const onAddFeature = useCallback(() => {
		if (mapId !== undefined) {
			navigate('/FeatureManager/Create', {
				state: { feature: dispatch(initFeatureFromMapCentre(mapId)) },
			});
		}
	}, [dispatch, mapId, navigate]);

	return (
		<SpeedDial
			ariaLabel="The primary button to create a new feature"
			icon={<AddLocationAlt />}
			onClick={onAddFeature}
			open={false}
			FabProps={{ disabled: mapId === undefined }}
		/>
	);
}
