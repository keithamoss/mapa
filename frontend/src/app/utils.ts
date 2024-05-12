import { startCase, toLower } from 'lodash-es';

export enum eAppEnv {
	DEVELOPMENT = 1,
	TEST = 2,
	PRODUCTION = 3,
}

export function getEnvironment(): eAppEnv {
	switch (import.meta.env.VITE_ENVIRONMENT) {
		case 'DEVELOPMENT':
			return eAppEnv.DEVELOPMENT;
		case 'TEST':
			return eAppEnv.TEST;
		case 'PRODUCTION':
			return eAppEnv.PRODUCTION;
	}
}

export function isDevelopment(): boolean {
	return getEnvironment() === eAppEnv.DEVELOPMENT;
}

export function getAPIBaseURL(): string {
	return import.meta.env.VITE_API_BASE_URL;
}

export function getBaseURL(): string {
	return import.meta.env.VITE_SITE_BASE_URL;
}

// https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
export function isTouchDevice() {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// https://stackoverflow.com/a/52695341
export const isInStandaloneMode = () =>
	window.matchMedia('(display-mode: standalone)').matches ||
	('standalone' in window.navigator && window.navigator.standalone) ||
	document.referrer.includes('android-app://');

export const titleCase = (string: string) => startCase(toLower(string));
