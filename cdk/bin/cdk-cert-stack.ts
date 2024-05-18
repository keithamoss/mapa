#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { UsEastCertificateStack } from '../lib/mapa-us-east-certificate-stack';

const app = new cdk.App();

// Ref: https://github.com/aws/aws-cdk/issues/9274
// Ref: https://medium.com/@mhkafadar/a-practical-aws-cdk-walkthrough-deploying-multiple-websites-to-s3-and-cloudfront-7caaabc9c327
const certStack = new UsEastCertificateStack(app, 'UsEastCertificateStack', {
	env: { account: '429260965153', region: 'us-east-1' }, // us-east-1 is the only region where ACM certificates can be created
});
