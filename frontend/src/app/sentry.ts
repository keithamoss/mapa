import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

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
		integrations: [new BrowserTracing()],

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1.0,

		// Or however deep you want your Redux state context to be
		normalizeDepth: 10,
	});

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return Sentry.createReduxEnhancer({
		// Optionally pass options listed below
	});
};
