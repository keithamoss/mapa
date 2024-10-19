import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/routing/routes';
import { authApi } from './app/services/auth';
import { store } from './app/store';
import { theme } from './app/ui/theme';
import { type MapaNamespace, MapaNamespaceDefaults } from './window';
// import './browserstack';

// Test 4

// Extend the global window object with MapaNamespace so we have a place to load the Icons Library into
// Ref: https://stackoverflow.com/questions/12709074/how-do-you-explicitly-set-a-new-property-on-window-in-typescript
declare global {
	interface Window {
		MapaNamespace: MapaNamespace;
		// log: (msg: string) => void;
	}
}

window.MapaNamespace = MapaNamespaceDefaults;

const container = document.getElementById('root')!;
const root = createRoot(container);

store.dispatch(authApi.endpoints.checkLoginStatus.initiate());

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<RouterProvider router={router} />
				</ThemeProvider>
			</LocalizationProvider>
		</Provider>
	</React.StrictMode>,
);
