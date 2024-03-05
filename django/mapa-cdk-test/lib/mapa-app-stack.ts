import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { HttpVersion, PriceClass } from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { GetCertificate } from './modules/get-certificate';
import { ContextEnvProps } from './utils/get-env-context';
import { titleCase } from './utils/utils';

export interface InfraStackProps {
	vpc: ec2.Vpc;
	logGroup: logs.LogGroup;
	ecrRepo: ecr.Repository;
	s3LoggingBucket: s3.Bucket;
}

export interface MapaAppStackPropsWithContextEnv extends cdk.StackProps {
	context: ContextEnvProps;
	infraStack: InfraStackProps;
}

export class MapaAppStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props: MapaAppStackPropsWithContextEnv) {
		// https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html#typescript-cdk-idioms
		const { context: contextProps, ...ogProps } = props;
		super(scope, id, ogProps);

		const defaultSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
			props.infraStack.vpc,
			'DjangoAppLambdaVPCDefaultSecurityGroup',
			props.infraStack.vpc.vpcDefaultSecurityGroup,
		);

		// Lambda function
		const djangoLambda = new lambda.DockerImageFunction(this, 'DjangoApp', {
			// Image config
			code: lambda.DockerImageCode.fromEcr(props.infraStack.ecrRepo, {
				tagOrDigest: 'latest',
				cmd: ['lambda_gunicorn'],
			}),
			// General config
			functionName: `Mapa-${titleCase(contextProps.environment)}-Django-Lambda`,
			description: `Mapa ${titleCase(contextProps.environment)} Django Lambda`,
			memorySize: 1024,
			ephemeralStorageSize: cdk.Size.mebibytes(512),
			timeout: cdk.Duration.seconds(15),
			// Environment variables
			environment: contextProps.lmabdaEnvironment,
			// VPC config
			vpc: props.infraStack.vpc,
			vpcSubnets: { subnets: props.infraStack.vpc.publicSubnets },
			securityGroups: [defaultSecurityGroup],
			allowPublicSubnet: true,
			// Monitoring and operations tools
			logFormat: 'JSON',
			applicationLogLevel: 'DEBUG',
			systemLogLevel: 'INFO',
			logGroup: props.infraStack.logGroup,
			tracing: lambda.Tracing.ACTIVE,
		});

		// Use the "Modifying the AWS CloudFormation resource behind AWS constructs" pattern to duck behind the scenes
		// and modify the vpcConfig prop that isn't exposed yet
		// FIXME: There's a brand new PR that will let us set this directly when creating the lambda
		// https://github.com/aws/aws-cdk/pull/28059
		const djangoLambdaEscapeHatch = djangoLambda.node.defaultChild as lambda.CfnFunction;
		djangoLambdaEscapeHatch.vpcConfig = {
			...djangoLambdaEscapeHatch.vpcConfig,
			ipv6AllowedForDualStack: true,
		};

		new CfnOutput(this, 'Lambda', { value: djangoLambda.functionArn });

		// This appears to be current best practice for managing secrets.
		// i.e. Allow CDK to create the skeleton of the secrets, wire that in to services that need it, then come in
		// after the first deployment (when the secret skeleton exists) and manually populate them.
		// StackOverflow seems to think this, at the moment at least, is fine and won't cause issues with drift that would cause CDK to come
		// back through and delete them.
		// So far, this seems to work perfectly.
		// Ref. https://stackoverflow.com/questions/70849198/why-is-it-recommended-to-manually-provision-pre-existing-secrets-in-aws-secretsm
		const secret = new cdk.aws_secretsmanager.Secret(this, 'DjangoAppSecrets', {
			secretName: `/mapa/${contextProps.environment}/`,
			description: 'Secrets for the Mapa Django Lambda app',
			secretObjectValue: {
				DB_HOST: cdk.SecretValue.unsafePlainText(''),
				DB_PORT: cdk.SecretValue.unsafePlainText(''),
				DB_USERNAME: cdk.SecretValue.unsafePlainText(''),
				DB_PASSWORD: cdk.SecretValue.unsafePlainText(''),
				DB_NAME: cdk.SecretValue.unsafePlainText(''),
				DB_SCHEMA: cdk.SecretValue.unsafePlainText(''),
				SECRET_KEY: cdk.SecretValue.unsafePlainText(''),
				SENTRY_DSN: cdk.SecretValue.unsafePlainText(''),
				SOCIAL_AUTH_GOOGLE_OAUTH2_KEY: cdk.SecretValue.unsafePlainText(''),
				SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET: cdk.SecretValue.unsafePlainText(''),
			},
		});

		if (djangoLambda.role === undefined) {
			throw new Error(`The role for the Django Lambda is undefined. This shouldn't happen!`);
		}

		secret.grantRead(djangoLambda.role);

		new CfnOutput(this, 'Secret', { value: secret.secretArn });

		// Lambda function URL
		const djangoLambdaFunctionURL = djangoLambda.addFunctionUrl({
			authType: lambda.FunctionUrlAuthType.NONE,
			invokeMode: lambda.InvokeMode.BUFFERED,
			// This is all handled by Django for the sake of portability between AWS and DO
			// cors: {
			// 	allowedOrigins: ['*'],
			// 	allowedHeaders: ['x-csrftoken'],
			// 	allowedMethods: [
			// 		lambda.HttpMethod.HEAD,
			// 		lambda.HttpMethod.GET,
			// 		lambda.HttpMethod.POST,
			// 		lambda.HttpMethod.PUT,
			// 		lambda.HttpMethod.PATCH,
			// 		lambda.HttpMethod.DELETE,
			// 	],
			// 	allowCredentials: true,
			// },
		});

		// https://ad6iweh4stx5u53vjud245hbbi0snads.lambda-url.ap-southeast-2.on.aws/
		new CfnOutput(this, 'LambdaFunctionURL', { value: djangoLambdaFunctionURL.url });

		// Grab our certificate from us-east-1 that the other stack nicely made for us
		const certificate = new GetCertificate(this, {
			domainName: contextProps.domainNameDjangoApp,
		}).cert;

		new CfnOutput(this, 'Certificate', { value: certificate.certificateArn });

		// CloudFront distribution
		const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
			// Overall distribution settings
			comment: contextProps.domainNameDjangoApp,
			priceClass: PriceClass.PRICE_CLASS_ALL,
			domainNames: [contextProps.domainNameDjangoApp],
			certificate: certificate,
			minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
			httpVersion: HttpVersion.HTTP2,
			enableLogging: true,
			logBucket: props.infraStack.s3LoggingBucket,
			logFilePrefix: 'mapa-app',
			logIncludesCookies: true,
			enableIpv6: true,
			defaultBehavior: {
				// Origin settings
				origin: new cloudfront_origins.HttpOrigin(cdk.Fn.parseDomainName(djangoLambdaFunctionURL.url), {
					// origin: new cloudfront_origins.HttpOrigin('6dd4cyrcemnyc7zdtgrpjxabw40iynek.lambda-url.ap-southeast-2.on.aws', {
					protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
					originSslProtocols: [cloudfront.OriginSslPolicy.TLS_V1_2],
					customHeaders: {
						'X-Forwarded-Host': contextProps.domainNameDjangoApp,
					},
					// No caching please, we need fresh responses
					originShieldEnabled: false,
				}),
				// Behaviour settings
				compress: true,
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
				cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
				originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
				// responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT,
			},
		});

		new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
		new CfnOutput(this, 'DistributionDomainname', { value: distribution.distributionDomainName });

		// Route 53 - Update to point at our CloudFront distribution
		const zone = route53.HostedZone.fromLookup(this, 'MapaHostedZone', { domainName: contextProps.domainName });

		new CfnOutput(this, 'Zone', { value: zone.hostedZoneArn });

		const record = new route53.ARecord(this, 'CloudFrontAliasRecord', {
			target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
			zone: zone,
			recordName: contextProps.domainNameDjangoApp,
		});

		new CfnOutput(this, 'DNSRecord', { value: record.toString() });
	}
}
