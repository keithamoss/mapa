import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, styled, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './App.css';
import WelcomeUser from './WelcomeUser';
import { useAppSelector } from './app/hooks/store';
import { Basemap, BasemapStyle, MapRenderer } from './app/services/auth';
import { featuresApi } from './app/services/features';
import { mapsApi } from './app/services/maps';
import { featureSchemasApi } from './app/services/schemas';
import { store } from './app/store';
import { getAPIBaseURL, isInStandaloneMode } from './app/utils';
import AddFeatureButton from './features/app/addFeatureButton';
import { selectActiveMapId } from './features/app/appSlice';
import SpeedDialNavigation from './features/app/speedDialNavigation';
import { isUserLoggedIn, selectUser } from './features/auth/authSlice';
import OLMap from './features/ol_map/olMap';

const LoginContainer = styled('div')`
	height: 100dvh;
	display: flex;
	align-items: center;
	justify-content: center;
`;

function App() {
	const location = useLocation();

	const theme = useTheme();

	const mapId = useAppSelector(selectActiveMapId);

	const user = useAppSelector(selectUser);

	const isLoggedIn = useAppSelector(isUserLoggedIn);

	// Without this, and setting `zIndex: theme.zIndex.speedDial + 1` in QuickAddSymbolsControlEntrypoint, we (a) can't click anything except for the first two QuickAdd icons and (b) when the SpeedDial opens it sits below the QuickAdd symbols.
	// tl;dr Toggle the zIndex of the SpeedDial depending on whether its open or not.
	const [boxZIndex, setBoxZIndex] = useState<string | undefined>(undefined);
	const onSpeedDialOpen = useCallback(() => {
		setBoxZIndex(`${theme.zIndex.speedDial + 2}`);
	}, [theme.zIndex.speedDial]);

	const onSpeedDialClose = useCallback(() => {
		// A slight delay to allow the SpeedDial to have closed first
		window.setTimeout(() => setBoxZIndex(undefined), 500);
	}, []);

	if (isLoggedIn === undefined) {
		return null;
	}

	const loader = document.getElementById('loader-container');
	loader?.remove();

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

	return (
		// <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
		<div className="App">
			{mapId !== undefined && (
				<OLMap
					mapRenderer={user.settings.map_renderer || MapRenderer.WebGLPointsLayer}
					basemap={user.settings.basemap || Basemap.MapboxVectorTile}
					basemap_style={user.settings.basemap_style || BasemapStyle.Monochrome}
				/>
			)}

			{location.pathname === '/' && (
				<React.Fragment>
					{mapId === undefined && <WelcomeUser />}

					<Box
						sx={{
							position: 'absolute',
							zIndex: boxZIndex,
							bottom: theme.spacing(isInStandaloneMode() === false ? 2 : 6),
							right: theme.spacing(2),
							// right: theme.spacing(isInStandaloneMode() === false ? 2 : 4),
						}}
					>
						<SpeedDialNavigation onSpeedDialOpen={onSpeedDialOpen} onSpeedDialClose={onSpeedDialClose} />

						<AddFeatureButton mapId={mapId} />
					</Box>
				</React.Fragment>
			)}

			<Outlet />
		</div>
		// </ErrorBoundary>
	);
}

export default App;
