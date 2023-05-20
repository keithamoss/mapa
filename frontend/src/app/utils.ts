// eslint-disable-next-line @typescript-eslint/naming-convention
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
		default:
			throw Error(`Invalid VITE_ENVIRONMENT '${import.meta.env.VITE_ENVIRONMENT}' encountered`);
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
