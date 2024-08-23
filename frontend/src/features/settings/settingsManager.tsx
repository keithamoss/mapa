import CloseIcon from '@mui/icons-material/Close';
import {
	AppBar,
	Button,
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
	SelectChangeEvent,
	Toolbar,
	Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks/store';
import { Basemap, BasemapStyle, MapRenderer, useUpdateUserProfileMutation } from '../../app/services/auth';
import { DialogWithTransition } from '../../app/ui/dialog';
import { getBaseURL } from '../../app/utils';
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
	}, [isUpdatingUpdateUserProfileSuccessful, navigate]);

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

	const findAllCacheEntries = async () => {
		// Get a list of all of the caches for this origin
		const cacheNames = await caches.keys();
		const result = [];

		for (const name of cacheNames) {
			// Open the cache
			const cache = await caches.open(name);

			// Get a list of entries. Each item is a Request object
			for (const request of await cache.keys()) {
				// If the request URL matches, add the response to the result
				// if (request.url.endsWith('.png')) {
				//   result.push(await cache.match(request));
				// }

				result.push(await cache.match(request));
			}
		}

		return result;
	};

	const isCacheAPIAvailable = 'caches' in self;

	const [cacheEntries, setCacheEntries] = useState<(Response | undefined)[]>();
	console.log('cacheEntries', cacheEntries);

	const [cacheResponseIconsLibrary, setCacheResponseIconsLibrary] = useState<Response | undefined>();
	console.log('cacheResponseIconsLibrary', cacheResponseIconsLibrary);

	const [cacheResponseIconsLibraryCategories, setCacheResponseIconsLibraryCategories] = useState<
		Response | undefined
	>();
	console.log('cacheResponseIconsLibraryCategories', cacheResponseIconsLibraryCategories);

	const cacheName = 'my-cache';
	const cacheHash = '2137551e43704e7d6cc4a2825540f1b6';
	const iconsLibraryURL = `/icons-library/icons-library.json?${cacheHash}`;
	const iconsLibraryCategoriesURL = `/icons-library/icons-categories-library.json?${cacheHash}`;

	const populateCache = async () => {
		if (isCacheAPIAvailable === true) {
			const cache = await caches.open(cacheName);
			console.log('cache', cache);

			// Icons Library
			cache.add(iconsLibraryURL);

			const request = new Request(iconsLibraryURL);
			console.log('request', request);

			// Icons Library Categories
			cache.add(iconsLibraryCategoriesURL);

			const request2 = new Request(iconsLibraryCategoriesURL);
			console.log('request2', request2);
		}
	};

	const readCache = async () => {
		if (isCacheAPIAvailable === true) {
			const cache = await caches.open(cacheName);
			console.log('cache', cache);

			const cacheEntries = await findAllCacheEntries();
			setCacheEntries(cacheEntries);

			// Icons Library
			const request = new Request(iconsLibraryURL);
			console.log('request', request);

			const response = await cache.match(request);
			setCacheResponseIconsLibrary(response);
			console.log('response', response);
			console.log('response.body', await response?.json());

			// Icons Library Categories
			const request2 = new Request(iconsLibraryCategoriesURL);
			console.log('request2', request2);

			const response2 = await cache.match(request2);
			setCacheResponseIconsLibraryCategories(response2);
			console.log('response2', response2);
			console.log('response2.body', await response2?.json());
		}
	};

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

					<FormControl sx={{ mb: 3 }} fullWidth>
						<FormLabel>Icons library caching experiment</FormLabel>
						<Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={populateCache}>
							Test Icons Library Cache: Populate
						</Button>
						<Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={readCache}>
							Test Icons Library Cache: Read
						</Button>
						Cache API Supported: {isCacheAPIAvailable === true ? 'Yes' : 'No'}
						<br />
						Icons Library:
						{cacheResponseIconsLibrary === undefined && 'TBA'}
						{cacheResponseIconsLibrary !== undefined && (
							<div style={{ marginBottom: '15px' }}>
								{cacheResponseIconsLibrary.status}
								<br />
								{cacheResponseIconsLibrary.url.replace(getBaseURL(), '')}
							</div>
						)}
						<br />
						Icons Library Categories:
						{cacheResponseIconsLibraryCategories === undefined && 'TBA'}
						{cacheResponseIconsLibraryCategories !== undefined && (
							<div style={{ marginBottom: '15px' }}>
								{cacheResponseIconsLibraryCategories.status}
								<br />
								{cacheResponseIconsLibraryCategories.url.replace(getBaseURL(), '')}
							</div>
						)}
						<br />
						Cache Entries:
						{cacheEntries !== undefined
							? cacheEntries.map((entry, idx) =>
									entry !== undefined ? (
										<div key={idx} style={{ marginBottom: '15px' }}>
											{entry.status}
											<br />
											{entry.url.replace(getBaseURL(), '')}
										</div>
									) : undefined,
								)
							: 'TBA'}
						<br />
					</FormControl>

					<FormControl sx={{ mb: 3 }} fullWidth>
						<FormLabel>Version debugging</FormLabel>

						<Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={() => window.location.reload()}>
							Reload
						</Button>

						{performance
							.getEntriesByType('resource')
							// .filter((e) => e.initiatorType === 'script')
							.map((e: any, idx) => {
								// console.log(e);
								return (
									<div key={idx} style={{ marginBottom: '15px' }}>
										{e.initiatorType}
										<br />
										{e.entryType}
										<br />
										{e.deliveryType !== '' && (
											<React.Fragment>
												{e.deliveryType}
												<br />
											</React.Fragment>
										)}
										{e.name}
									</div>
								);
							})}
					</FormControl>
				</Paper>
			</DialogWithTransition>
		</React.Fragment>
	);
}

export default SettingsManager;
