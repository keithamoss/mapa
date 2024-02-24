import { App, StackProps } from 'aws-cdk-lib';
import 'source-map-support/register';

export enum MapaEnvironment {
	STAGING = 'staging',
}

export interface ContextProps {
	domainName: string;
	domainNameDjangoApp: string;
	lmabdaEnvironment: { [key: string]: string };
}

export interface ContextEnvProps extends ContextProps {
	environment: MapaEnvironment;
}

export interface StackPropsWithContextEnv extends StackProps {
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
