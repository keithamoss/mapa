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

// https://phuoc.ng/collection/clipboard/check-if-the-clipboard-api-is-supported/
export const isClipboardApiSupported = () => !!(navigator.clipboard && navigator.clipboard.writeText);

// https://stackoverflow.com/a/61511955/7368493
// Not actually used, but useful if we ever need it
export const waitForElm = (selector: string) => {
	return new Promise((resolve) => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver((/* mutations */) => {
			if (document.querySelector(selector)) {
				observer.disconnect();
				resolve(document.querySelector(selector));
			}
		});

		// If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
};

export const isCacheApiSupported = () => 'caches' in self;

export const getLinkWithProtocol = (url: string | undefined) => {
	if (url === undefined || (typeof url === 'string' && url === '')) {
		return undefined;
	}

	// Assume that everything supports https these days
	// And obviously this makes a big assumption that the only protocols we'd ever see would be http or https
	return url.startsWith('http') === true ? url : `https://${url}`;
};

export const getLinkDomainName = (url: string | undefined) => {
	const urlWithProtocolForSure = getLinkWithProtocol(url);

	if (urlWithProtocolForSure !== undefined && URL.canParse(urlWithProtocolForSure) === true) {
		return new URL(urlWithProtocolForSure).host;
	}
	return undefined;
};
