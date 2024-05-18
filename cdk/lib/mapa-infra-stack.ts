import * as cdk from 'aws-cdk-lib';
import { CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { StackPropsWithContextEnv } from './utils/get-context';
import { getECRRepoName, titleCase } from './utils/utils';

export class MapaInfraStack extends Stack {
	public readonly ecrRepo: ecr.Repository;
	public readonly vpc: ec2.Vpc;
	public readonly s3LoggingBucket: s3.Bucket;

	constructor(scope: Construct, id: string, props: StackPropsWithContextEnv) {
		// https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html#typescript-cdk-idioms
		const { context: contextProps, ...ogProps } = props;
		super(scope, id, ogProps);

		const ecrRepo = new ecr.Repository(this, 'DjangoLambdaECRRepo', {
			repositoryName: getECRRepoName(contextProps.environment),
			imageTagMutability: ecr.TagMutability.MUTABLE,
			imageScanOnPush: true,
			encryption: ecr.RepositoryEncryption.KMS,
			removalPolicy: RemovalPolicy.RETAIN,
		});

		new CfnOutput(this, 'DjangoLambdasECRRepository', { value: ecrRepo.repositoryArn });

		// Well this was a fun adventure - learnt a lot more about how AWS networking fits together.
		// Ref. The original step-by-step guide I used to create the first working version by hand:
		//   https://4sysops.com/archives/assign-an-ipv6-address-to-an-ec2-instance-dual-stack/
		// Ref. A good example of a CDK version of a network stack:
		//   https://github.com/aws-samples/aws-vpc-builder-cdk/blob/main/lib/vpc-interface-endpoints-stack.ts
		// Ref. Another reference I used for the IPV6 side of things:
		//   https://sgryphon.gamertheory.net/2023/11/deploying-a-secure-lwm2m-ipv6-test-server-on-aws/

		// VPC
		const vpc = new ec2.Vpc(this, 'DjangoLambdasVPC', {
			vpcName: `mapa-${contextProps.environment}-lambda`,
			ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
			maxAzs: 2,
			natGateways: 0,
			enableDnsHostnames: true,
			enableDnsSupport: true,
			restrictDefaultSecurityGroup: false,
		});

		if (vpc.internetGatewayId === undefined) {
			throw new Error(`The Internet Gateway for the VPC is undefined. This shouldn't happen!`);
		}

		new CfnOutput(this, 'DjangoLambdasVPCARN', { value: vpc.vpcArn });
		new CfnOutput(this, 'DjangoLambdasVPCInternetGateway', { value: vpc.internetGatewayId });
		new CfnOutput(this, 'DjangoLambdasVPCDefaultSecurityGroup', { value: vpc.vpcDefaultSecurityGroup });

		const defaultSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
			vpc,
			'DjangoLambdasVPCDefaultSecurityGroup',
			vpc.vpcDefaultSecurityGroup,
		);

		// @TODO We didn't need anymore, right?
		// const egressOnlyInternetGateway = new ec2.CfnEgressOnlyInternetGateway(this, 'VPCEgressOnlyInternetGateway', {
		// 	vpcId: vpc.vpcId,
		// });

		// Allocate a new Amazon-provided IPv6 CIDR block (/56) to this VPC from our account's region
		const ipv6PublicBlock = new ec2.CfnVPCCidrBlock(vpc, 'MapaVPCIpv6PublicBlock', {
			vpcId: vpc.vpcId,
			amazonProvidedIpv6CidrBlock: true,
		});

		// Get the vpc's internet gateway so we can create default routes for the
		// public subnets.
		const internetGateway = ec2.GatewayVpcEndpoint.fromGatewayVpcEndpointId(
			vpc,
			'DjangoLambdasVPCInternetGateway',
			vpc.internetGatewayId,
		);

		const projectsDatabaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
			this,
			'ProjectsDatabaseSecurityGroup',
			'sg-08651a2d801c9164f',
		);

		// Modify each public subnet so that it has both a public route and an ipv6 CIDR
		vpc.publicSubnets.forEach((subnet, index) => {
			// Add a default ipv6 route to the subnet's route table
			// to ensure that external IPv6 traffic is routed to the internet gateway.
			const unboxedSubnet = subnet as ec2.Subnet;
			unboxedSubnet.addRoute('IPv6Default', {
				routerId: internetGateway.vpcEndpointId,
				routerType: ec2.RouterType.GATEWAY,
				destinationIpv6CidrBlock: '::/0',
			});

			const cfnSubnet = subnet.node.defaultChild as ec2.CfnSubnet;

			cfnSubnet.assignIpv6AddressOnCreation = true;
			cfnSubnet.enableDns64 = true;
			cfnSubnet.mapPublicIpOnLaunch = false;

			// Use the intrinsic Fn::Cidr CloudFormation function on the VPC's
			// first IPv6 block to determine ipv6 /64 cidrs for each subnet as
			// a function of the public subnet's index.
			const vpcCidrBlock = cdk.Fn.select(0, vpc.vpcIpv6CidrBlocks);
			const ipv6Cidrs = cdk.Fn.cidr(vpcCidrBlock, vpc.publicSubnets.length, '64');
			cfnSubnet.ipv6CidrBlock = cdk.Fn.select(index, ipv6Cidrs);

			new CfnOutput(this, `Subnet-${index}-DjangoLambdasIPV6CIDRBlock`, { value: cfnSubnet.ipv6CidrBlock });

			// The subnet depends on the ipv6 cidr being allocated.
			cfnSubnet.addDependency(ipv6PublicBlock);

			// Update the security group for the database to allow each new /64 IPv6 range to access it
			// this.securityGroup.addIngressRule(Peer.anyIpv6(), Port.tcp(22), 'Allow IPv6 SSH (22) inbound');

			// Note: This would be better done using the 'connections' interface rather than manipulating ingress rules
			// e.g. djangoLambda.connections.allowTo(ec2, ports, ...)
			// Alas, we don't build the database as part of this service, and there's no ec2.Instance.fromInstanceId method() like there is for other services.
			// We can revisit this when we put the database into a CDK stack and get the output parameters from that to expose the instanceId.
			// Ref: https://stackoverflow.com/a/74191444
			projectsDatabaseSecurityGroup.addIngressRule(
				ec2.Peer.ipv6(cfnSubnet.ipv6CidrBlock),
				ec2.Port.tcp(5432),
				'[CDK] Allow IPv6 PostgreSQL (5432) inbound from the Mapa Lambdas VPC',
			);
		});

		// S3 bucket for CloudFront logs
		const s3LoggingBucket = new s3.Bucket(this, `Mapa-${titleCase(contextProps.environment)}-Logs`, {
			bucketName: `mapa-${contextProps.environment}-logs`,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
			encryption: s3.BucketEncryption.S3_MANAGED,
			enforceSSL: true,
			versioned: true,
			removalPolicy: RemovalPolicy.RETAIN,
		});

		new CfnOutput(this, 'S3CloudFrontLoggingBucket', { value: s3LoggingBucket.bucketName });

		this.vpc = vpc;
		this.ecrRepo = ecrRepo;
		this.s3LoggingBucket = s3LoggingBucket;
	}
}
