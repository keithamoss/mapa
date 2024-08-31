import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';

if ('VITE_SENTRY_DSN' in import.meta.env === false) {
	throw new Error('VITE_SENTRY_DSN not found');
}

export const sentryInit = () => {
	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		environment: `${import.meta.env.VITE_ENVIRONMENT}-PUBLIC`.toUpperCase(),
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		site: import.meta.env.VITE_SENTRY_SITE_NAME,
		attachStacktrace: true,
		integrations: [
			new Sentry.BrowserTracing({
				routingInstrumentation: Sentry.reactRouterV6Instrumentation(
					useEffect,
					useLocation,
					useNavigationType,
					createRoutesFromChildren,
					matchRoutes,
				),
			}),
		],

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1.0,

		// Or however deep you want your Redux state context to be
		normalizeDepth: 10,

		beforeSendTransaction(event) {
			// `getFeatures(undefined)` here may be behind the "undefined is not an object" we were seeing in Safari
			// ...
			try {
				// Don't send mapFeatures as it's exceeds Sentry's 1MB limit for event and transaction context on large maps
				// Ref: https://develop.sentry.dev/sdk/envelopes/#size-limits
				// Avoid "The operand of a 'delete' operator must be optional" by casting to any
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
				delete (event.contexts?.state?.state.value.app as any).mapFeatures;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
				delete (event.contexts?.state?.state.value.api as any).queries['getFeatures(undefined)'].data;
			} catch {
				/* empty */
				console.log('debug1');
			}

			// IMPORTANT: This doesn't actually fix the issue because event.breadcrumbs contains the full history of all requests/actions, which themselves contain the full mapFeatures responses.
			// Giving up on this...for now.

			return event;
		},

		beforeSend(event) {
			if (event.exception) {
				Sentry.showReportDialog({ eventId: event.event_id });
			}

			// `getFeatures(undefined)` here may be behind the "undefined is not an object" we were seeing in Safari
			// ...
			try {
				// Don't send mapFeatures as it's exceeds Sentry's 1MB limit for event and transaction context on large maps
				// Ref: https://develop.sentry.dev/sdk/envelopes/#size-limits
				// Avoid "The operand of a 'delete' operator must be optional" by casting to any
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
				delete (event.contexts?.state?.state.value.app as any).mapFeatures;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
				delete (event.contexts?.state?.state.value.api as any).queries['getFeatures(undefined)'].data;
			} catch {
				/* empty */
				console.log('debug2');
			}

			// IMPORTANT: This doesn't actually fix the issue because event.breadcrumbs contains the full history of all requests/actions, which themselves contain the full mapFeatures responses.
			// Giving up on this...for now.

			return event;
		},
	});

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return Sentry.createReduxEnhancer({
		// Optionally pass options listed below
	});
};
