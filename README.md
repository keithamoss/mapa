# Welcome to Mapa

For H, with ❤️

# Create self-signed SSL certs for local development

Install [mkcert](https://github.com/FiloSottile/mkcert) and generate self-signed certs for local dev.

```
brew install mkcert
mkcert -install
```

```
mkdir keys && cd $_
mkcert mapa.test.keithmoss.me
mkcert api.mapa.test.keithmoss.me
```

# Database initialistion

```sql
CREATE SCHEMA mapa;
```

# User setup

Add yourself to the app_allowedusers table before trying to login.

https://mapa.test.keithmoss.me/api/login/google-oauth2/

# Local development setup

- Run `yarn dlx @yarnpkg/sdks vscode` in the `frontend` folder (and then move the contents of the `.vscode` to the root)
- [Set Up ESLint and Prettier in a React TypeScript App (2023)](https://dev.to/eshankvaish/set-up-eslint-and-prettier-in-a-react-typescript-app-2022-29c9)

If you're having trouble with yarn, try running:

```
rm -f .yarn*
yarn set version 3.x
yarn install
```

To dump all deps en masse:

```
npm install -g npm-check-updates
npm-check-updates -u
yarn install
```

# AWS deployment backstory (Production and Staging)

First, the backstory. Then we'll get on to the step-by-step instructions.

To begin with, this will all initially inspired by a search that lead us to [https://github.com/fun-with-serverless/serverless-django/tree/main](serverless-django).

## Getting IPv6 working so the Lambdas have a defined range that we control

We needed the lambdas to have a defined IP range so we could safely lock down the PostgreSQL EC2.

We couldn't use Elastic IPv4s because they cost USD$3.6/month now due to supply limitations, but IPv6's on the other hand are widely and freely available and AWS supports setting up dual-stack IPv4 and IPv6 VPCs now.

Ref https://4sysops.com/archives/assign-an-ipv6-address-to-an-ec2-instance-dual-stack/ for the setup process which involves a fair bit of faffing around in networking land, but isn't actually that complex.

The last piece of the puzzle was remembering that we had to connect to the PostgreSQL server (`DB_HOST`) over IPv6 in order for the Lambda to present their IPv6 addresses.

This involved setting up the EC2 again and choosing the "Auto-assign IPv6 IP" option during creation.

[Announcing AWS Lambda’s support for Internet Protocol Version 6 (IPv6) for outbound connections in VPC](https://aws.amazon.com/about-aws/whats-new/2023/10/aws-lambda-ipv6-outbound-connections-vpc/)

> Previously, Lambda functions configured with an IPv4-only or dual-stack VPC could access VPC resources only over IPv4. To work around the constrained number of IPv4 addresses in VPC, customers modernizing their applications were required to build complex architectures or use network translation mechanisms. With today’s launch, Lambda functions can access resources in dual-stack VPC over IPv6 and get virtually unlimited scale, using a simple function level switch. You can also enable VPC-configured Lambda functions to access the internet using egress-only internet gateway.

Further reading: https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html

## Giving internet access to Lambdas

A lot of the advice focussed around setting up a NAT gateway (~USD$40/month), but that'll defeat the whole point of this exercise - cost savings!

([Accessing the Internet from VPC Connected Lambda Functions using a NAT Gateway](https://nodogmablog.bryanhogan.net/2022/06/accessing-the-internet-from-vpc-connected-lambda-functions-using-a-nat-gateway/) covers the older/traditional approach before Lambdas supported IPv6 and dual stack IPv4/IPv6 networking.)

We, for some reason yet to be established, didn't end up going this route - and yet it still works with no NAT gateway and only an Internet Gateway. There's no Egress-only Internet Gateway attached to the Lambda VPC.

- https://repost.aws/knowledge-center/internet-access-lambda-function

# AWS deployment step-by-step (Production and Staging)

There's a few things we need to do manually for a new deployment (or re-deployment):

## Setting up our IAM user, linking up GitHub Actions, and deploying the TrustStack

Firstly, let's get access setup.

This approached is based on [https://medium.com/@mylesloffler/using-github-actions-to-deploy-a-cdk-application-f28b7f792f12](Using GitHub Actions to deploy a CDK application).

A key part of this is deploying our `TrustStack` which takes care of connecting GitHub Actions and AWS, creating policies to allow roles to modify the Mapa stack, and creating a role to allow GitHub Actions to run automated deploymenst for us (as well as our own `mapa-cdk` user for manual deployments).

Ref: https://stackoverflow.com/questions/57118082/what-iam-permissions-are-needed-to-use-cdk-deploy

1. Create an IAM user called `mapa-cdk` and temporarily give it Administrator permissions (they'll all come from assuming roles)
2. Now setup the AWS CLI to use it:

```
[mapa-cdk]
aws_access_key_id=
aws_secret_access_key=
```

```
[profile mapa-cdk]
region=ap-southeast-2
output=json
```

3. Deploy TrustStack `cdk deploy TrustStack --context env=[env] --profile mapa-cdk-role`
4. Update `~/.aws/credentials` and add an entry for our `mapa-cdk-role`

```
[mapa-cdk-role]
role_arn=arn:aws:iam::[accountid]:role/TrustStack-GitHubActionsRole-[foobar]
source_profile=mapa-cdk
```

5. Now we can safely remove Administrator permissions from `mapa-cdk` - everything we do from now on will use permissions assumed through `mapa-cdk-role`.

## Setup Route 53

Righto, let's start at the top - giving AWS what it needs to run DNS for the static site and API.

We need to manually establish a hosted zone in Route 53 to give AWS delegated permissions to manage DNS for everything in, and under, the `mapa[.staging].keithmoss.me` namespace. This means we can use AWS TO create SSL certificates and associate CloudFront distributions with our domain name.

Approach inspired by:

- https://serverfault.com/questions/847175/cloudflare-aws-route-53-combined-to-handle-records
- https://medium.com/@walid.karray/configuring-a-custom-domain-for-aws-lambda-function-url-with-serverless-framework-c0d78abdc253

1. Setup a new hosted zone for `mapa[.staging].keithmoss.me`
2. Note the 4 NS records AWS just gave us - we'll need them for CloudFlare
3. Hop over to CloudFlare (the overall DNS controller for keithmoss.me) and populate the four NS records (DNS only, no proxy)

## First stack time deployment / redeployment

For deployment to a blank environment to work, we need to deploy in two stages: Infrastructure first, pushing the Docker image, and finally deployment of the application.

1. Deploy UsEastCert and InfraStack `cdk deploy UsEastCertificateStack MapaInfraStack --context env=[env] --profile mapa-cdk-role`
2. Now build and push a Docker image for the application to use `manual_build_and_push_django_lambdas_image.sh` (change `[env]`)
3. Now deploy the application itself `cdk deploy MapaAppStack MapaStaticSiteStack --context env=[env] --profile mapa-cdk-role`
4. Lastly, we can now add the application secrets in Secrets Manager (ref. `aws-secrets.[env].json` templates locally in this repo)

# Destroying a stack

If we need to completely destory a stack (for redeployment or otherwise), there's a few steps to go through:

1. Empty the StaticSiteS3Bucket that contains the application assets first. (If you don't, CDK will complain it can't delete it. No need to archive it, if you redeploy the stack it'll all get rebuilt anyway.)
2. Now you can safely destroy everything `cdk destroy UsEastCertificateStack MapaInfraStack MapaAppStack MapaStaticSiteStack --context env=[env] --profile mapa-cdk-role`
3. Lastly, there's a few things that need cleaning up by hand that CDK doesn't take care of for us:
   3.1 Delete the ECR repo
   3.2 Delete the relevant CloudWach Log Groups
   3.3 Delete (and archive) the contents of thr S3 logging bucket
   3.4 Delete the StaticSiteS3Bucket

# GitHub Actions

GitHub Actions runs CI/CD for our staging and prod environments.

The `TrustStack` deployed via CDK takes care of setting up a relationship between GitHub and AWS to allow Actions to run CloudFormation and modify our deployment.

The only manualy configuration required is populating the relevant secrets in GitHub Actions:

- AWS_GITHUB_ACTIONS_ROLE: The ARN of the role created by `TrustStack`
- AWS_TARGET_REGION: ap-southeast-2
- FRONTEND_STAGING_ENV
- WEB_DB_STAGING_ENV
- WEB_STAGING_ENV

# Tips

1. If you ever delete or recreate the Route 53 Hosted Zones, be sure to delete the cache of Hosted Zone identifiers that CDK maintains locally in `cdk.context.json` or it'll try and use Hosted Zones that no longer exist.
