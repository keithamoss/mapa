import { isRejectedWithValue, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Sentry from '@sentry/browser';
import Cookies from 'js-cookie';
import { getAPIBaseURL, isDevelopment } from '../utils';

export const api = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: `${getAPIBaseURL()}/0.1/`,
		prepareHeaders: (headers) => {
			const token = Cookies.get('csrftoken');
			if (token) {
				// file deepcode ignore WrongCsrfTokenHeader: <please specify a reason of ignoring this>
				headers.set('X-CSRFToken', token);
			}
			return headers;
		},
	}),
	endpoints: () => ({}),
	/**
	 * Tag types must be defined in the original API definition
	 * for any tags that would be provided by injected endpoints
	 */
	tagTypes: ['User', 'Map', 'Feature', 'FeatureSchema'],
});

// Global API error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const rtkQueryErrorLogger: Middleware = (_api: MiddlewareAPI) => (next) => (action) => {
	// c.f. https://github.com/reduxjs/redux-toolkit/issues/331
	if (isRejectedWithValue(action)) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if (action.payload.originalStatus === 400 || action.payload.originalStatus === 404) {
			// APIClient used to handle these differently, but we didn't document why...
			// console.error('@TODO Implement 400 and 404 handling');
			// ...so we'll continue and let it be logged by Sentry so we can find out
		}

		if (isDevelopment() === true) {
			// eslint-disable-next-line no-console
			console.error(
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
				`${action.error.message} [${action.payload.originalStatus}: ${action.payload.status}] for ${action.type}`,
				action
			);
		} else {
			Sentry.captureException(
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
				`${action.error.message} [${action.payload.originalStatus}: ${action.payload.status}] for ${action.type}`
			);
			Sentry.captureException(action);
			Sentry.showReportDialog();
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return next(action);
};
