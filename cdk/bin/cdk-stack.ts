#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import 'source-map-support/register';
import { MapaAppStack } from '../lib/mapa-app-stack';
import { MapaInfraStack } from '../lib/mapa-infra-stack';
import { MapaStaticSiteStack } from '../lib/mapa-static-site-stack';
import { UsEastCertificateStack } from '../lib/mapa-us-east-certificate-stack';
import { TrustStack } from '../lib/trust-stack';
import { getEnvContext } from '../lib/utils/get-context';
import { titleCase } from '../lib/utils/utils';

const app = new cdk.App();

// https://rehanvdm.com/blog/4-methods-to-configure-multiple-environments-in-the-aws-cdk
const envContext = getEnvContext(app);

// Ref: https://github.com/aws/aws-cdk/issues/9274
// Ref: https://medium.com/@mhkafadar/a-practical-aws-cdk-walkthrough-deploying-multiple-websites-to-s3-and-cloudfront-7caaabc9c327
const trustStack = new TrustStack(app, 'TrustStack', {
	env: { account: '429260965153', region: 'ap-southeast-2' },
});

// Ref: https://github.com/aws/aws-cdk/issues/9274
// Ref: https://medium.com/@mhkafadar/a-practical-aws-cdk-walkthrough-deploying-multiple-websites-to-s3-and-cloudfront-7caaabc9c327
const certStack = new UsEastCertificateStack(app, 'UsEastCertificateStack', {
	env: { account: '429260965153', region: 'us-east-1' }, // us-east-1 is the only region where ACM certificates can be created
	crossRegionReferences: true,
	context: envContext,
});

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

	crossRegionReferences: true,

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

	crossRegionReferences: true,

	context: envContext,

	// Ref. https://bobbyhadz.com/blog/aws-cdk-share-resources-between-stacks
	infraStack: {
		s3LoggingBucket: infraStack.s3LoggingBucket,
	},
});

// Add tags to all constructs in all stacks
[certStack, infraStack, mapaAppStack, mapaStaticSiteStack].forEach((stack) =>
	Tags.of(stack).add('StackName', `Mapa-${titleCase(envContext.environment)}`),
);
