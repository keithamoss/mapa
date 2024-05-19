#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { TrustStack } from '../lib/trust-stack';

const app = new cdk.App();

// Ref: https://github.com/aws/aws-cdk/issues/9274
// Ref: https://medium.com/@mhkafadar/a-practical-aws-cdk-walkthrough-deploying-multiple-websites-to-s3-and-cloudfront-7caaabc9c327
const trustStack = new TrustStack(app, 'TrustStack', {
	env: { account: '429260965153', region: 'ap-southeast-2' },

	githubOrg: 'keithamoss',
	githubRepo: 'mapa',
	iamUsername: 'mapa-cdk',
});
