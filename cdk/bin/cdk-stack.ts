#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import 'source-map-support/register';
import { MapaAppStack } from '../lib/mapa-app-stack';
import { MapaInfraStack } from '../lib/mapa-infra-stack';
import { MapaStaticSiteStack } from '../lib/mapa-static-site-stack';
import { getEnvContext } from '../lib/utils/get-context';
import { titleCase } from '../lib/utils/utils';

const app = new cdk.App();

// https://rehanvdm.com/blog/4-methods-to-configure-multiple-environments-in-the-aws-cdk
const envContext = getEnvContext(app);

// https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
const infraStack = new MapaInfraStack(app, 'MapaInfraStack', {
	env: { account: '429260965153', region: 'ap-southeast-2' },
	context: envContext,
});

const mapaAppStack = new MapaAppStack(app, 'MapaAppStack', {
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

	context: envContext,

	// Ref. https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
	infraStack: {
		vpc: infraStack.vpc,
		ecrRepo: infraStack.ecrRepo,
		s3LoggingBucket: infraStack.s3LoggingBucket,
	},
});

const mapaStaticSiteStack = new MapaStaticSiteStack(app, 'MapaStaticSiteStack', {
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

	context: envContext,

	// Ref. https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
	infraStack: {
		s3LoggingBucket: infraStack.s3LoggingBucket,
	},
});

// Add tags to all constructs in all stacks
[infraStack, mapaAppStack, mapaStaticSiteStack].forEach((stack) =>
	Tags.of(stack).add('StackName', `Mapa-${titleCase(envContext.environment)}`),
);
