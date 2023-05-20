/// <reference types="react-scripts" />

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'test' | 'production';
			REACT_APP_ENVIRONMENT: 'DEVELOPMENT' | 'TEST' | 'PRODUCTION';
			REACT_APP_API_BASE_URL: string;
			REACT_APP_SITE_BASE_URL: string;
		}
	}
}

export {};
