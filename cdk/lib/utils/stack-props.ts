import { StackProps } from 'aws-cdk-lib';
import 'source-map-support/register';

export interface BaseStackProps extends StackProps {
	env: {
		account: string;
		region: string;
	};
}

export interface BaseStackPropsWithEnvironment extends BaseStackProps {
	environment: MapaEnvironment;
}

export enum MapaEnvironment {
	STAGING = 'staging',
	PRODUCTION = 'production',
}
