import { AddLocationAlt } from '@mui/icons-material';
import { styled } from '@mui/material';
import SpeedDial from '@mui/material/SpeedDial';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks/store';
import { initFeatureFromMapCentre } from '../features/featuresSlice';

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
	position: 'absolute',
	bottom: theme.spacing(2),
	right: theme.spacing(2),
}));

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
		<StyledSpeedDial
			ariaLabel="The primary button to create a new feature"
			icon={<AddLocationAlt />}
			onClick={onAddFeature}
			open={false}
			FabProps={{ disabled: mapId === undefined }}
		/>
	);
}
