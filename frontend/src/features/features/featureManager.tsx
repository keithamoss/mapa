import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { DialogWithTransition } from '../../app/ui/dialog';
import { getFeaturesAvailableForEditing, setFeaturesAvailableForEditing } from '../app/appSlice';
import { defaultSymbolSizeForFormFields, getFontAwesomeIconForSymbolPreview } from '../symbology/symbologyHelpers';
import { getFeatureLabel } from './featureHelpers';

function FeatureManager() {
	const navigate = useNavigate();

	const dispatch = useAppDispatch();

	const features = useAppSelector(getFeaturesAvailableForEditing);

	const onClickFeature = (featureId: number) => () => navigate(`/FeatureManager/Edit/${featureId}/`);

	const onClose = () => {
		dispatch(setFeaturesAvailableForEditing([]));
		navigate('/');
	};

	return (
		<DialogWithTransition
			// For some reason this was causing the dialog to close as soon as it opened
			// onClose={onClose}
			dialogProps={{ fullScreen: false, fullWidth: true }}
		>
			<DialogTitle>Edit Features</DialogTitle>
			<DialogContent>
				<List>
					{features.map((feature) => (
						<React.Fragment key={feature.id}>
							<ListItem disablePadding>
								<ListItemIcon sx={{ minWidth: defaultSymbolSizeForFormFields }}>
									{getFontAwesomeIconForSymbolPreview(
										{ ...feature.symbol },
										{
											size: defaultSymbolSizeForFormFields,
										},
									)}
								</ListItemIcon>
								<ListItemButton onClick={onClickFeature(feature.id)}>
									<ListItemText primary={getFeatureLabel(feature) || <em>Unnamed feature</em>} />
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
