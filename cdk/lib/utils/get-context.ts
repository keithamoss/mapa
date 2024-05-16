import { App, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'source-map-support/register';

export interface BaseStackProps extends StackProps {
	env: {
		account: string;
		region: string;
	};
}

export enum MapaEnvironment {
	STAGING = 'staging',
	PRODUCTION = 'production',
}

export interface ContextProps {
	domainName: string;
	domainNameDjangoApp: string;
	lambdaEnvironment: { [key: string]: string };
}

export interface ContextEnvProps extends ContextProps {
	environment: MapaEnvironment;
}

export interface StackPropsWithContextEnv extends BaseStackProps {
	context: ContextEnvProps;
}

export const getEnvContext = (app: App): ContextEnvProps => {
	const envName = app.node.tryGetContext('env') as MapaEnvironment;
	if (Object.values(MapaEnvironment).includes(envName) === false) {
		throw new Error(`Environment name '${envName}' not configured`);
	}

	const contextProps = app.node.tryGetContext(envName) as ContextProps;
	if (!contextProps) {
		throw new Error(`Environment props not found in context for environment name '${envName}'`);
	}

	return { ...contextProps, environment: envName };
};

export interface TrustStackContextProps {
	githubOrg: string;
	githubRepo: string;
	iamUsername: string;
}

export const getTrustStackContext = (scope: Construct): TrustStackContextProps => {
	const contextProps = scope.node.tryGetContext('truststack') as TrustStackContextProps;
	if (!contextProps) {
		throw new Error(`TrustStack props not found in context`);
	}

	return contextProps;
};
