import CloseIcon from '@mui/icons-material/Close';
import {
	AppBar,
	FormControl,
	FormControlLabel,
	FormLabel,
	IconButton,
	InputLabel,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	Select,
	type SelectChangeEvent,
	Toolbar,
	Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { Basemap, BasemapStyle, MapRenderer, useUpdateUserProfileMutation } from '../../app/services/auth';
import { DialogWithTransition } from '../../app/ui/dialog';
import { selectUser } from '../auth/authSlice';

function SettingsManager() {
	const user = useAppSelector(selectUser);

	const navigate = useNavigate();

	const [
		updateUserProfile,
		{
			isSuccess: isUpdatingUpdateUserProfileSuccessful,
			// isLoading: isUpdatingUpdateUserProfileLoading,
		},
	] = useUpdateUserProfileMutation();

	// See note in MapEditor about usage of useEffect
	useEffect(() => {
		if (isUpdatingUpdateUserProfileSuccessful === true) {
			window.location.href = '/';
		}
	}, [isUpdatingUpdateUserProfileSuccessful]);

	const onMapRendererChange = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
		if (value in MapRenderer) {
			updateUserProfile({ map_renderer: value as MapRenderer });
		}
	};

	const onBasemapChange = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
		if (value in Basemap) {
			updateUserProfile({ basemap: value as Basemap });
		}
	};

	const onBasemapStyleChange = (event: SelectChangeEvent<BasemapStyle>) => {
		updateUserProfile({ basemap_style: event.target.value as BasemapStyle });
	};

	const onClose = () => navigate('/');

	if (user === null) {
		return null;
	}

	return (
		<React.Fragment>
			<DialogWithTransition onClose={onClose}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onClose}>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Settings
						</Typography>
					</Toolbar>
				</AppBar>

				<Paper elevation={0} sx={{ m: 3 }}>
					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormLabel id="radio-buttons-group-map-renderer-label">Latest Google Drive Backup</FormLabel>

						{user.last_gdrive_backup !== null
							? new Date(user.last_gdrive_backup).toLocaleString('en-GB', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: 'numeric',
									minute: 'numeric',
									second: 'numeric',
								})
							: 'Never backed up 😬'}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormLabel id="radio-buttons-group-map-renderer-label">Map Renderer</FormLabel>
						<RadioGroup
							aria-labelledby="radio-buttons-group-map-renderer-label"
							defaultValue={user?.settings.map_renderer || MapRenderer.WebGLPointsLayer}
							name="radio-buttons-group-map-renderer"
							onChange={onMapRendererChange}
						>
							<FormControlLabel value="WebGLPointsLayer" control={<Radio />} label="GPU" />
							<FormControlLabel value="VectorImageLayer" control={<Radio />} label="Canvas" />
						</RadioGroup>
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormLabel id="radio-buttons-group-basemap-label">Basemap</FormLabel>
						<RadioGroup
							aria-labelledby="radio-buttons-group-basemap-label"
							defaultValue={user?.settings.basemap || Basemap.MapboxVectorTile}
							name="radio-buttons-group-basemap"
							onChange={onBasemapChange}
						>
							<FormControlLabel value="MapboxVectorTile" control={<Radio />} label="Vector" />
							<FormControlLabel value="MapboxWMTS" control={<Radio />} label="Image" />
						</RadioGroup>
					</FormControl>

					<FormControl sx={{ mb: 3 }} fullWidth>
						<InputLabel id="basemap-style-label">Style</InputLabel>
						<Select
							labelId="basemap-style-label"
							defaultValue={user?.settings.basemap_style || BasemapStyle.Monochrome}
							label="Style"
							onChange={onBasemapStyleChange}
						>
							{Object.entries(BasemapStyle).map(([name, id]) => (
								<MenuItem key={id} value={id}>
									{name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Paper>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default SettingsManager;
