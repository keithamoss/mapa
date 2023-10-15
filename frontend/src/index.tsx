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
// import './browserstack';

// https://github.com/bvaughn/react-error-boundary/issues/126
// which links to https://github.com/facebook/react/issues/15069
// eslint-disable-next-line no-console
// console.error = () => {};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
