import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { DialogWithTransition } from '../../app/ui/dialog';
import { getSelectedFeatureIds, setSelectedFeatures } from '../app/appSlice';

function FeatureManager() {
	const navigate = useNavigate();

	const dispatch = useAppDispatch();

	const featureIds = useAppSelector(getSelectedFeatureIds);

	const onClickFeature = (featureId: number) => () => navigate(`/FeatureManager/Edit/${featureId}/`);

	const onClose = () => {
		dispatch(setSelectedFeatures([]));
		navigate('/');
	};

	return (
		<DialogWithTransition
			// For some reason this was causing the dialog to close as soon as it opened
			// onClose={onClose}
			dialogProps={{ fullScreen: false, fullWidth: true }}
		>
			<DialogTitle>Features</DialogTitle>
			<DialogContent>
				<List>
					{featureIds.map((featureId) => (
						<React.Fragment key={featureId}>
							<ListItem disablePadding>
								<ListItemButton onClick={onClickFeature(featureId)}>
									<ListItemText primary={`# ${featureId}`} />
								</ListItemButton>
							</ListItem>

							<Divider />
						</React.Fragment>
					))}
				</List>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
			</DialogActions>
		</DialogWithTransition>
	);
}

export default FeatureManager;
