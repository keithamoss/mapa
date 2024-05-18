import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { BaseStackProps, getTrustStackContext } from './utils/get-context';
import { getDjangoAppLambdaFunctionName, getDjangoCronLambdaFunctionName, getECRRepoName } from './utils/utils';

// Ref: https://medium.com/@mylesloffler/using-github-actions-to-deploy-a-cdk-application-f28b7f792f12

export class TrustStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: BaseStackProps) {
		super(scope, id, props);

		const contextProps = getTrustStackContext(scope);

		// -- Defines an OpenID Connect (OIDC) provider for GitHub Actions. --
		// This provider will be used by the GitHub Actions workflow to
		// assume a role which can be used to deploy the CDK application.
		const githubProvider = new iam.CfnOIDCProvider(this, 'GitHubOIDCProvider', {
			// BEWARE: This thumbprint does nothing now because AWS users trusted root certs with GitHub and a few other providers.
			// However, CDK still insists that we pass a valid thumbprint.
			// Ref: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc_verify-thumbprint.html
			thumbprintList: ['6938fd4d98bab03faadb97b34396831e3780aea1'],
			url: 'https://token.actions.githubusercontent.com', // <-- 1 per account
			clientIdList: ['sts.amazonaws.com'], // <-- Tokens are intended for STS
		});
		// See: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#adding-the-identity-provider-to-aws
		// Thumbprint from: https://github.blog/changelog/2022-01-13-github-actions-update-on-oidc-based-deployments-to-aws/
		//    ^--- This value can be calculated, but it won't change regularly.
		//         You can also retrieve by providing starting the provider
		//         creation process in the AWS Console and using the
		//         "Get thumbprint" button after selecting OpenID Connect
		//         as the type and inputting the provider URL.

		// Policy to allow GitHub Actions to push new versions of the Django Docker container to ECR
		const policyPushImageToECRRepo = new ManagedPolicy(this, 'PushImageToECRRepo', {
			statements: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					// https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-push.html
					actions: [
						'ecr:CompleteLayerUpload',
						'ecr:UploadLayerPart',
						'ecr:InitiateLayerUpload',
						'ecr:BatchCheckLayerAvailability',
						'ecr:PutImage',
					],
					resources: [`arn:aws:ecr:${props.env.region}:${props.env.account}:repository/${getECRRepoName('*')}`],
				}),
			],
		});

		// Policy to allow GitHub Actions to update the version of the Django Docker container used by the lambdas
		const policyManageDjangoLambdaFunctions = new ManagedPolicy(this, 'ManageDjangoLambdaFunctions', {
			statements: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['lambda:UpdateFunctionCode', 'lambda:GetFunction'],
					resources: [
						`arn:aws:lambda:${props.env.region}:${props.env.account}:function:${getDjangoAppLambdaFunctionName('*')}`,
						`arn:aws:lambda:${props.env.region}:${props.env.account}:function:${getDjangoCronLambdaFunctionName('*')}`,
					],
				}),
			],
		});

		// Policy to allow GitHub Actions to throw an event at EventBridge that triggers management events (e.g. Django migrations)
		const policyPutManagementEvents = new ManagedPolicy(this, 'PutManagementEvents', {
			statements: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['events:PutEvents'],
					resources: [`arn:aws:events:${props.env.region}:${props.env.account}:event-bus/default`],
				}),
			],
		});

		const githubActionsRole = new iam.CfnRole(this, 'GitHubActionsRole', {
			managedPolicyArns: [
				iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly').managedPolicyArn,
				policyPushImageToECRRepo.managedPolicyArn,
				policyManageDjangoLambdaFunctions.managedPolicyArn,
				policyPutManagementEvents.managedPolicyArn,
			],
			policies: [
				// -- A policy to permit assumption of the default AWS CDK roles. --
				// Allows assuming roles tagged with an aws-cdk:bootstrap-role tag of
				// certain values (file-publishing, lookup, deploy) which permit the CDK
				// application to look up existing values, publish assets, and create
				// CloudFormation changesets. These roles are created by CDK's
				// bootstrapping process. See:
				// https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html
				//
				// WARNING: The CDK `deploy` role allows the CDK to execute changes via
				//          CloudFormation with its execution role. The execution role
				//          has full administrative permissions. It can only be assumed
				//          by CloudFormation, but you should still be aware.
				{
					policyName: 'AssumeCDKDeploymentRoles',
					policyDocument: {
						Version: '2012-10-17',
						Statement: [
							{
								Effect: 'Allow',
								Action: 'sts:AssumeRole',
								Resource: 'arn:aws:iam::*:role/cdk-*',
								Condition: {
									StringEquals: {
										'aws:ResourceTag/aws-cdk:bootstrap-role': ['file-publishing', 'lookup', 'deploy'],
									},
								},
							},
						],
					},
				},
			],
			assumeRolePolicyDocument: {
				Statement: [
					// -- Defines a role that can be assumed by our regular IAM user. --
					// This role will be used by us for manual testing and development deployments.
					{
						Effect: iam.Effect.ALLOW,
						Action: ['sts:AssumeRole'],
						Principal: {
							AWS: `arn:aws:iam::${props.env.account}:user/${contextProps.iamUsername}`,
						},
					},
					// -- Defines a role that can be assumed by GitHub Actions. --
					// This role will be used by the GitHub Actions workflow to deploy the stack.
					// It is assumable only by GitHub Actions running against the `main` branch
					{
						Effect: iam.Effect.ALLOW,
						Action: ['sts:AssumeRoleWithWebIdentity'], // <-- Allows use of OIDC identity
						Principal: {
							Federated: githubProvider.attrArn,
						},
						Condition: {
							StringLike: {
								// This specifies that the subscriber (sub) claim must be the main
								// branch of your repository. You can use wildcards here, but
								// you should be careful about what you allow.
								'token.actions.githubusercontent.com:sub': [
									// `repo:${githubOrg.valueAsString}/${githubRepo.valueAsString}:ref:refs/heads/main`,
									`repo:${contextProps.githubOrg}/${contextProps.githubRepo}:*`,
								],
							},
							// This specifies that the audience (aud) claim must be sts.amazonaws.com
							StringEquals: {
								'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
							},
						},
					},
				],
			},
		});

		new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
			value: githubActionsRole.attrArn,
			description: 'The role ARN for GitHub Actions to use during deployment.',
		});
	}
}
