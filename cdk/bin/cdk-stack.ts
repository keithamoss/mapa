#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import 'source-map-support/register';
import { MapaAppStack } from '../lib/mapa-app-stack';
import { MapaInfraStack } from '../lib/mapa-infra-stack';
import { MapaStaticSiteStack } from '../lib/mapa-static-site-stack';
import { MapaEnvironment } from '../lib/utils/stack-props';

const app = new cdk.App();

// ######################
// Staging
// ######################
// https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
const infraStackStaging = new MapaInfraStack(app, 'MapaInfraStackStaging', {
	env: { account: '429260965153', region: 'ap-southeast-2' },
	environment: MapaEnvironment.STAGING,
});

const mapaAppStackStaging = new MapaAppStack(app, 'MapaAppStackStaging', {
	/* If you don't specify 'env', this stack will be environment-agnostic.
	 * Account/Region-dependent features and context lookups will not work,
	 * but a single synthesized template can be deployed anywhere. */

	/* Uncomment the next line to specialize this stack for the AWS Account
	 * and Region that are implied by the current CLI configuration. */
	// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

	/* Uncomment the next line if you know exactly what Account and Region you
	 * want to deploy the stack to. */
	env: { account: '429260965153', region: 'ap-southeast-2' },

	/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

	environment: MapaEnvironment.STAGING,

	// Ref. https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
	infraStack: {
		vpc: infraStackStaging.vpc,
		ecrRepo: infraStackStaging.ecrRepo,
		s3LoggingBucket: infraStackStaging.s3LoggingBucket,
	},

	domainName: 'mapa.staging.keithmoss.me',
	domainNameDjangoApp: 'api.mapa.staging.keithmoss.me',
	certificateArnDjangoApp: 'arn:aws:acm:us-east-1:429260965153:certificate/28e133cb-751a-4f44-a7d3-79c52f74394f',
	lambdaEnvironment: {
		ENVIRONMENT: 'STAGING',
		PORT: '8000',
		ALLOWED_HOSTS: 'api.mapa.staging.keithmoss.me,127.0.0.1',
		RUST_LOG: 'warn',
		AWS_LAMBDA_DEPLOYMENT: 'TRUE',
		AWS_LWA_ENABLE_COMPRESSION: 'true',
		AWS_LWA_PORT: '8000',
		AWS_SECRETS_NAME: '/mapa/staging/',
		// deepcode ignore NoHardcodedPasswords: <please specify a reason of ignoring this>
		AWS_LWA_PASS_THROUGH_PATH: '/0.1/management/events',
		DJANGO_DEBUG: 'TRUE',
		PUBLIC_API_BASE_URL: 'https://api.mapa.staging.keithmoss.me',
		PUBLIC_SITE_URL: 'https://mapa.staging.keithmoss.me',
		SITE_BASE_URL: 'https://mapa.staging.keithmoss.me',
		SESSION_COOKIE_DOMAIN: '.mapa.staging.keithmoss.me',
		CORS_ALLOWED_ORIGINS: 'https://mapa.staging.keithmoss.me',
		CSRF_COOKIE_DOMAIN: '.mapa.staging.keithmoss.me',
		CSRF_TRUSTED_ORIGINS: 'https://mapa.staging.keithmoss.me',
		SENTRY_SITE_NAME: 'Mapa',
		POWERTOOLS_DEBUG: '1',
		POWERTOOLS_LOG_LEVEL: 'DEBUG',
		POWERTOOLS_SERVICE_NAME: 'Mapa-Django-Staging',
	},
});

const mapaStaticSiteStackStaging = new MapaStaticSiteStack(app, 'MapaStaticSiteStackStaging', {
	/* If you don't specify 'env', this stack will be environment-agnostic.
	 * Account/Region-dependent features and context lookups will not work,
	 * but a single synthesized template can be deployed anywhere. */

	/* Uncomment the next line to specialize this stack for the AWS Account
	 * and Region that are implied by the current CLI configuration. */
	// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

	/* Uncomment the next line if you know exactly what Account and Region you
	 * want to deploy the stack to. */
	env: { account: '429260965153', region: 'ap-southeast-2' },

	/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

	environment: MapaEnvironment.STAGING,

	// Ref. https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
	infraStack: {
		s3LoggingBucket: infraStackStaging.s3LoggingBucket,
	},

	domainName: 'mapa.staging.keithmoss.me',
	certificateArnStaticSite: 'arn:aws:acm:us-east-1:429260965153:certificate/9b66e8c3-92bf-49e7-a502-854f1f6edeb4',
});

// Add tags to all constructs in all stacks
[infraStackStaging, mapaAppStackStaging, mapaStaticSiteStackStaging].forEach((stack) =>
	Tags.of(stack).add('StackName', `Mapa-Staging`),
);
// ######################
// Staging (End)
// ######################

// ######################
// Production
// ######################
// https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
const infraStackProduction = new MapaInfraStack(app, 'MapaInfraStackProduction', {
	env: { account: '429260965153', region: 'ap-southeast-2' },
	environment: MapaEnvironment.PRODUCTION,
});

const mapaAppStackProduction = new MapaAppStack(app, 'MapaAppStackProduction', {
	/* If you don't specify 'env', this stack will be environment-agnostic.
	 * Account/Region-dependent features and context lookups will not work,
	 * but a single synthesized template can be deployed anywhere. */

	/* Uncomment the next line to specialize this stack for the AWS Account
	 * and Region that are implied by the current CLI configuration. */
	// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

	/* Uncomment the next line if you know exactly what Account and Region you
	 * want to deploy the stack to. */
	env: { account: '429260965153', region: 'ap-southeast-2' },

	/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

	environment: MapaEnvironment.PRODUCTION,

	// Ref. https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
	infraStack: {
		vpc: infraStackProduction.vpc,
		ecrRepo: infraStackProduction.ecrRepo,
		s3LoggingBucket: infraStackProduction.s3LoggingBucket,
	},

	domainName: 'mapa.keithmoss.me',
	domainNameDjangoApp: 'api.mapa.keithmoss.me',
	certificateArnDjangoApp: 'arn:aws:acm:us-east-1:429260965153:certificate/ecaf60d5-f748-4f63-b420-f24ef97e8f4b',
	lambdaEnvironment: {
		ENVIRONMENT: 'PRODUCTION',
		PORT: '8000',
		ALLOWED_HOSTS: 'api.mapa.keithmoss.me,127.0.0.1',
		RUST_LOG: 'warn',
		AWS_LAMBDA_DEPLOYMENT: 'TRUE',
		AWS_LWA_ENABLE_COMPRESSION: 'true',
		AWS_LWA_PORT: '8000',
		AWS_SECRETS_NAME: '/mapa/production/',
		// deepcode ignore NoHardcodedPasswords: <please specify a reason of ignoring this>
		AWS_LWA_PASS_THROUGH_PATH: '/0.1/management/events',
		DJANGO_DEBUG: 'TRUE',
		PUBLIC_API_BASE_URL: 'https://api.mapa.keithmoss.me',
		PUBLIC_SITE_URL: 'https://mapa.keithmoss.me',
		SITE_BASE_URL: 'https://mapa.keithmoss.me',
		SESSION_COOKIE_DOMAIN: '.mapa.keithmoss.me',
		CORS_ALLOWED_ORIGINS: 'https://mapa.keithmoss.me',
		CSRF_COOKIE_DOMAIN: '.mapa.keithmoss.me',
		CSRF_TRUSTED_ORIGINS: 'https://mapa.keithmoss.me',
		SENTRY_SITE_NAME: 'Mapa',
		POWERTOOLS_DEBUG: '1',
		POWERTOOLS_LOG_LEVEL: 'INFO',
		POWERTOOLS_SERVICE_NAME: 'Mapa-Django-Production',
	},
});

const mapaStaticSiteStackProduction = new MapaStaticSiteStack(app, 'MapaStaticSiteStackProduction', {
	/* If you don't specify 'env', this stack will be environment-agnostic.
	 * Account/Region-dependent features and context lookups will not work,
	 * but a single synthesized template can be deployed anywhere. */

	/* Uncomment the next line to specialize this stack for the AWS Account
	 * and Region that are implied by the current CLI configuration. */
	// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

	/* Uncomment the next line if you know exactly what Account and Region you
	 * want to deploy the stack to. */
	env: { account: '429260965153', region: 'ap-southeast-2' },

	/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

	environment: MapaEnvironment.PRODUCTION,

	// Ref. https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
	infraStack: {
		s3LoggingBucket: infraStackProduction.s3LoggingBucket,
	},

	domainName: 'mapa.keithmoss.me',
	certificateArnStaticSite: 'arn:aws:acm:us-east-1:429260965153:certificate/b06d0d7c-4156-4b74-bce3-52abbf175286',
});

// Add tags to all constructs in all stacks
[infraStackProduction, mapaAppStackProduction, mapaStaticSiteStackProduction].forEach((stack) =>
	Tags.of(stack).add('StackName', `Mapa-Production`),
);
// ######################
// Production (End)
// ######################
