import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { GetCertificate } from './modules/get-certificate';
import { ContextEnvProps } from './utils/get-env-context';

export interface InfraStackProps {
	s3LoggingBucket: s3.Bucket;
}

export interface MapaStaticSiteStackPropsWithContextEnv extends cdk.StackProps {
	context: ContextEnvProps;
	infraStack: InfraStackProps;
}

export class MapaStaticSiteStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props: MapaStaticSiteStackPropsWithContextEnv) {
		// https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html#typescript-cdk-idioms
		const { context: contextProps, ...ogProps } = props;
		super(scope, id, ogProps);

		new CfnOutput(this, 'S3LoggingBucketFromInfraStack', { value: props.infraStack.s3LoggingBucket.bucketName });

		// Grab our certificate from us-east-1 that the other stack nicely made for us
		const certificate = new GetCertificate(this, {
			domainName: contextProps.domainName,
		}).cert;

		new CfnOutput(this, 'StaticSiteCertificate', { value: certificate.certificateArn });

		const cloudFrontToS3 = new CloudFrontToS3(this, 'S3BucketStaticSite', {
			bucketProps: {
				bucketName: contextProps.domainName,
				publicReadAccess: false,
				blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
				encryption: s3.BucketEncryption.S3_MANAGED,
				enforceSSL: true,
				versioned: true,
				serverAccessLogsBucket: props.infraStack.s3LoggingBucket,
				// Gets glued together with the default value for targetObjectKeyFormat, hence needing the trailing /
				serverAccessLogsPrefix: 'mapa-static-site-s3-server-access-logging/',
			},
			cloudFrontDistributionProps: {
				// Overall distribution settings
				comment: contextProps.domainName,
				priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
				certificate: certificate,
				domainNames: [contextProps.domainName],
				minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
				httpVersion: cloudfront.HttpVersion.HTTP2,
				enableLogging: true,
				logBucket: props.infraStack.s3LoggingBucket,
				logFilePrefix: 'mapa-static-site',
				logIncludesCookies: true,
				enableIpv6: true,
				defaultBehavior: {
					// Behaviour settings
					compress: true,
					viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
					// @TODO Desired state = always cache files w/ hashes in their names, never cache anything else?
					// @TODO Or cache everything and we'll use cache invalidation to nuke it each update?
					// cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
				},
			},
		});

		new CfnOutput(this, 'S3StaticSiteBucket', { value: cloudFrontToS3.s3BucketInterface.bucketName });
		new CfnOutput(this, 'StaticSiteDistributionId', { value: cloudFrontToS3.cloudFrontWebDistribution.distributionId });
		new CfnOutput(this, 'StaticSiteDistributionDomainname', {
			value: cloudFrontToS3.cloudFrontWebDistribution.distributionDomainName,
		});

		// Route 53 - Update to point at our CloudFront distribution
		const zone = route53.HostedZone.fromLookup(this, 'MapaHostedZone', {
			domainName: contextProps.domainName,
		});

		new CfnOutput(this, 'Zone', { value: zone.hostedZoneArn });

		const record = new route53.ARecord(this, 'CloudFrontAliasRecord', {
			target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cloudFrontToS3.cloudFrontWebDistribution)),
			zone: zone,
			recordName: contextProps.domainName,
		});

		new CfnOutput(this, 'DNSRecord', { value: record.toString() });

		// Bucket deployment
		const deployment = new BucketDeployment(this, 'Website Deployment', {
			// Here goes the path to your website files.
			// The path is relative to the root folder of your CDK app.
			sources: [Source.asset('./build/')],
			destinationBucket: cloudFrontToS3.s3BucketInterface,
			distribution: cloudFrontToS3.cloudFrontWebDistribution,
			distributionPaths: ['/*'],
		});

		new CfnOutput(this, 'DeploymedBucketArn', { value: deployment.deployedBucket.bucketArn });
	}
}
