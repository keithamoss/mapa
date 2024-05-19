import { MapaEnvironment } from './stack-props';

export const getECRRepoName = (environment: MapaEnvironment | '*') =>
	`aws-keithmoss/${environment}/mapa-django-lambdas`;

export const getDjangoAppLambdaFunctionName = (environment: MapaEnvironment | '*') =>
	`Mapa-${titleCase(environment)}-Django-App-Lambda`;

export const getDjangoCronLambdaFunctionName = (environment: MapaEnvironment | '*') =>
	`Mapa-${titleCase(environment)}-Django-Cron-Lambda`;

export const titleCase = (str: string) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
