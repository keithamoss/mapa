import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, styled, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './App.css';
import WelcomeUser from './WelcomeUser';
import { useAppDispatch, useAppSelector } from './app/hooks/store';
import { Basemap, BasemapStyle, MapRenderer } from './app/services/auth';
import { featuresApi } from './app/services/features';
import { mapsApi } from './app/services/maps';
import { featureSchemasApi } from './app/services/schemas';
import { store } from './app/store';
import { WholeScreenLoadingIndicator } from './app/ui/wholeScreenLoadingIndicator';
import { getAPIBaseURL, isInStandaloneMode } from './app/utils';
import AddFeatureButton from './features/app/addFeatureButton';
import { isMapLoadingViaRTKOrManuallySpecified, selectActiveMapId } from './features/app/appSlice';
import MapSwitcher from './features/app/mapsSwitcher';
import SpeedDialNavigation from './features/app/speedDialNavigation';
import { isMapLoadingViaRTK, selectUser } from './features/auth/authSlice';
import OLMap from './features/ol_map/olMap';
import { loadIconsLibrary } from './features/symbology/iconsLibraryLoader';

const LoginContainer = styled('div')`
	height: 100dvh;
	display: flex;
	align-items: center;
	justify-content: center;
`;

function App() {
	const dispatch = useAppDispatch();

	const location = useLocation();

	const theme = useTheme();

	const mapId = useAppSelector(selectActiveMapId);

	const user = useAppSelector(selectUser);

	const isLoggedInLoading = useAppSelector(isMapLoadingViaRTK);

	const isMapLoading = useAppSelector(isMapLoadingViaRTKOrManuallySpecified);

	// ######################
	// Speed Dial Z-Index Workaround
	// ######################
	// Without this, and setting `zIndex: theme.zIndex.speedDial + 1` in OLMap, we (a) can't click anything except for the first two QuickAdd icons and (b) when the SpeedDial opens it sits below all of the on-map buttons.
	// tl;dr Toggle the zIndex of the SpeedDial depending on whether its open or not.
	const [boxZIndex, setBoxZIndex] = useState<string | undefined>(undefined);

	const onSpeedDialOpen = useCallback(() => {
		setBoxZIndex(`${theme.zIndex.speedDial + 4}`);
	}, [theme.zIndex.speedDial]);

	const onSpeedDialClose = useCallback(() => {
		// A slight delay to allow the SpeedDial to have closed first
		window.setTimeout(() => setBoxZIndex(undefined), 500);
	}, []);

	const onMapsSwitcherSpeedDialOpen = useCallback(() => {
		setBoxZIndex(`${theme.zIndex.speedDial}`);
	}, [theme.zIndex.speedDial]);

	const onMapsSwitcherSpeedDialClose = useCallback(() => {
		// A slight delay to allow the SpeedDial to have closed first
		window.setTimeout(() => setBoxZIndex(undefined), 500);
	}, []);
	// ######################
	// Speed Dial Z-Index Workaround (End)
	// ######################

	// ######################
	// Icons Library Loading
	// ######################
	const [iconsLibraryLoaded, setIconsLibraryLoaded] = useState(window.MapaNamespace.iconsLibrary.loaded);

	// The first time we render, start loading the icons library
	useEffect(() => {
		loadIconsLibrary().then(() => {
			if (
				window.MapaNamespace.iconsLibrary.icons !== undefined &&
				window.MapaNamespace.iconsLibrary.categories !== undefined
			) {
				setIconsLibraryLoaded(true);
			}
		});
	}, []);

	useEffect(() => {
		if (iconsLibraryLoaded === true) {
			document.getElementById('loader-container')?.remove();
		}
	}, [dispatch, iconsLibraryLoaded]);
	// ######################
	// Icons Library Loading (End)
	// ######################

	if (isLoggedInLoading === true) {
		// Don't return the loading indicator until the Icons Library is loaded, because the heart loader is showing until then
		return iconsLibraryLoaded === true ? <WholeScreenLoadingIndicator /> : null;
	}

	if (user === null) {
		return (
			<LoginContainer>
				<Button
					variant="contained"
					size="large"
					startIcon={<GoogleIcon />}
					onClick={() => (window.location.href = `${getAPIBaseURL()}/social_django/login/google-oauth2/`)}
				>
					Login
				</Button>
			</LoginContainer>
		);
	}

	// This is the better approach because usePrefetch() runs into "you can't call hooks conditionally"
	// Important: We're pre-fetching *after* we have a user object to avoid 403s
	void store.dispatch(mapsApi.endpoints.getMaps.initiate());
	void store.dispatch(featureSchemasApi.endpoints.getFeatureSchemas.initiate());
	void store.dispatch(featuresApi.endpoints.getFeatures.initiate());

	if (iconsLibraryLoaded !== true) {
		return null;
	}

	return (
		// <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
		<div className="App">
			{mapId !== undefined && (
				<OLMap
					mapId={mapId}
					mapRenderer={user.settings.map_renderer || MapRenderer.WebGLPointsLayer}
					basemap={user.settings.basemap || Basemap.MapboxVectorTile}
					basemap_style={user.settings.basemap_style || BasemapStyle.Monochrome}
				/>
			)}

			{isMapLoading === true && <WholeScreenLoadingIndicator />}

			{location.pathname === '/' && (
				<React.Fragment>
					{mapId === undefined && <WelcomeUser />}

					<Box
						sx={{
							position: 'absolute',
							zIndex: boxZIndex,
							bottom: theme.spacing(isInStandaloneMode() === false ? 11 : 15),
							right: theme.spacing(2),
							// Ensures the user can still interact with the map underneath this Box
							pointerEvents: 'none',
						}}
					>
						<SpeedDialNavigation onSpeedDialOpen={onSpeedDialOpen} onSpeedDialClose={onSpeedDialClose} />
					</Box>

					<Box
						sx={{
							position: 'absolute',
							bottom: theme.spacing(isInStandaloneMode() === false ? 2 : 6),
							right: theme.spacing(2),
						}}
					>
						<AddFeatureButton mapId={mapId} />
					</Box>

					<Box
						sx={{
							position: 'absolute',
							bottom: theme.spacing(isInStandaloneMode() === false ? 4 : 8),
							left: theme.spacing(2),
							// Ensures the user can still interact with the map underneath this Box
							pointerEvents: 'none',
						}}
					>
						<MapSwitcher
							onSpeedDialOpen={onMapsSwitcherSpeedDialOpen}
							onSpeedDialClose={onMapsSwitcherSpeedDialClose}
						/>
					</Box>
				</React.Fragment>
			)}

			<Outlet />
		</div>
		// </ErrorBoundary>
	);
}

export default App;
