import DeleteIcon from '@mui/icons-material/Delete';

import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { useDeleteFeatureMutation } from '../../app/services/features';
import { DialogWithTransition } from '../../app/ui/dialog';
import { getSelectedFeatureIds, setSelectedFeatures } from '../app/appSlice';

interface Props {}

function FeatureManager(props: Props) {
	console.log('### FeatureManager ###');

	const navigate = useNavigate();

	const dispatch = useAppDispatch();

	const featureIds = useAppSelector(getSelectedFeatureIds);

	// ######################
	// Deleting Features
	// ######################
	const [deleteFeature, { isSuccess: isDeleteFeatureSuccessful /*, isLoading: isDeleteFeatureLoading*/ }] =
		useDeleteFeatureMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isDeleteFeatureSuccessful === true) {
			navigate(-1);
		}
	}, [isDeleteFeatureSuccessful, navigate]);

	// if (isDeleteFeatureSuccessful === true) {
	//   navigate(-1);
	// }

	const onDeleteFeature = (featureId: number) => () => {
		// eslint-disable-next-line no-restricted-globals
		if (confirm('Are you sure?') === true) {
			deleteFeature(featureId);
		}
	};
	// ######################
	// Deleting Features (End)
	// ######################

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
							<ListItem
								secondaryAction={
									<IconButton edge="end" onClick={onDeleteFeature(featureId)}>
										<DeleteIcon />
									</IconButton>
								}
								disablePadding
							>
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
