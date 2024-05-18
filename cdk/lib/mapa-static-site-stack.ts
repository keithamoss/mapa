import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import * as cdk from 'aws-cdk-lib';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { ContextEnvProps } from './utils/get-context';

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

		// Grab our certificate from us-east-1 that the standalone cert stack nicely made for us
		const certificate = Certificate.fromCertificateArn(
			this,
			`${contextProps.domainName}-Cert`,
			contextProps.certificateArnStaticSite,
		) as Certificate;

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
				removalPolicy: RemovalPolicy.DESTROY,
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
					responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
					// BucketDeployment ensures that the appropriate invalidations are run when content is updated
					cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
				},
			},
			// We already use `cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS` above, so let's skip the even stricer
			// security headers that this inserts for us.
			// In our case, the strict Content Security Policy headers broke lots of things.
			// We started shaving that yak, but it wasn't worth it!
			insertHttpSecurityHeaders: false,
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
