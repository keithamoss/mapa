import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Divider from '@mui/material/Divider';

import { AppBar, Button, IconButton, List, ListItemButton, ListItemIcon, Toolbar, useTheme } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { useUpdateUserProfileMutation } from '../../app/services/auth';
import { DialogWithTransition } from '../../app/ui/dialog';
import { mapaThemeSecondaryBlue } from '../../app/ui/theme';
import { WholeScreenLoadingIndicator } from '../../app/ui/wholeScreenLoadingIndicator';
import { defaultSearchParameters, selectActiveMapId, setFilteredFeatures, setSearchParameters } from '../app/appSlice';
import {
	defaultMapHeroIcon,
	defaultMapHeroIconColour,
	defaultMapHeroIconOpacity,
	defaultSymbolSizeForFormFields,
	getFontAwesomeIconForSymbolPreview,
} from '../symbology/symbologyHelpers';
import { selectAllMaps } from './mapsSlice';

function MapManager() {
	const mapId = useAppSelector(selectActiveMapId);

	const theme = useTheme();

	const maps = useAppSelector(selectAllMaps);

	const navigate = useNavigate();

	const dispatch = useAppDispatch();

	const [
		updateUserProfile,
		{ isSuccess: isUpdatingUpdateUserProfileSuccessful, isLoading: isUpdatingUpdateUserProfileLoading },
	] = useUpdateUserProfileMutation();

	const onSwitchMap = (mapId: number) => () => {
		updateUserProfile({ last_map_id: mapId });

		dispatch(setSearchParameters(defaultSearchParameters));
		dispatch(setFilteredFeatures([]));
	};

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isUpdatingUpdateUserProfileSuccessful === true) {
			navigate('/');
		}
	}, [isUpdatingUpdateUserProfileSuccessful, navigate]);

	// if (isUpdatingUpdateUserProfileSuccessful === true) {
	//   navigate("/");
	// }

	// Downside of this is it was conflicting with ControlPanel re-rendering.
	// React was warning about multiple components re-rendering at the same tiem
	// and advised to look for the 'bad setState call'.
	// I think the docs describe how to do this properly, so let's revisit later.
	//   if (isUpdatingUpdateUserProfileSuccessful === true) {
	//     console.log("isUpdatingUpdateUserProfileSuccessful");
	//     // navigate("/");
	//   }

	const onClickMap = (mapId: number) => () => navigate(`/MapManager/Edit/${mapId}/`);

	const onClickMapHeroIcon = (mapId: number) => () => navigate(`/MapManager/Edit/${mapId}/hero_icon/`);

	const onClose = () => navigate('/');

	const onCreate = () => navigate('/MapManager/Create');

	return (
		<React.Fragment>
			<DialogWithTransition onClose={onClose}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onClose}>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Maps
						</Typography>
						<Button color="inherit" onClick={onCreate}>
							Create
						</Button>
					</Toolbar>
				</AppBar>

				<List>
					{maps.map((map) => (
						<React.Fragment key={map.id}>
							<ListItem
								secondaryAction={
									<IconButton
										edge="end"
										sx={{ mr: 1, backgroundColor: map.id === mapId ? mapaThemeSecondaryBlue : 'whitesmoke' }}
										onClick={onSwitchMap(map.id)}
									>
										{map.id === mapId ? <VisibilityIcon sx={{ color: 'white' }} /> : <VisibilityOffIcon />}
									</IconButton>
								}
							>
								<ListItemIcon sx={{ pl: 1 }} onClick={onClickMapHeroIcon(map.id)}>
									{map.hero_icon !== null
										? getFontAwesomeIconForSymbolPreview(map.hero_icon, {
												size: defaultSymbolSizeForFormFields,
											})
										: getFontAwesomeIconForSymbolPreview({
												icon: defaultMapHeroIcon,
												colour: defaultMapHeroIconColour,
												opacity: defaultMapHeroIconOpacity,
												size: defaultSymbolSizeForFormFields,
											})}
								</ListItemIcon>

								<ListItemButton onClick={onClickMap(map.id)} sx={{ pl: 0 }}>
									<ListItemText primary={map.name} />
								</ListItemButton>
							</ListItem>

							<Divider />
						</React.Fragment>
					))}
				</List>
			</DialogWithTransition>

			{/* Bump the z-index of the WholeScreenLoadingIndicator up so it's visible above the modal dialog we're in */}
			{isUpdatingUpdateUserProfileLoading === true && <WholeScreenLoadingIndicator zIndex={theme.zIndex.modal + 1} />}
		</React.Fragment>
	);
}

export default MapManager;
