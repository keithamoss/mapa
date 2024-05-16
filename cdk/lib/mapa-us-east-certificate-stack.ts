import { Stack } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { StackPropsWithContextEnv } from './utils/get-context';
import { getCertificateArns } from './utils/utils';

export class UsEastCertificateStack extends Stack {
	constructor(scope: Construct, id: string, props: StackPropsWithContextEnv) {
		// https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html#typescript-cdk-idioms
		const { context: contextProps, ...ogProps } = props;
		super(scope, id, ogProps);

		const zoneProduction = route53.HostedZone.fromLookup(this, 'USEastHostedZoneProduction', {
			domainName: 'mapa.keithmoss.me',
		});

		const zoneStaging = route53.HostedZone.fromLookup(this, 'USEastHostedZoneStaging', {
			domainName: 'mapa.staging.keithmoss.me',
		});

		[
			// Domains need to be hard-coded rather than using contextProps values because otherwise certificate-arns.json ends up with the same pairs tokens used across all environments.
			'mapa.keithmoss.me',
			'api.mapa.keithmoss.me',
		].forEach((domainName) => {
			const certificate = new Certificate(this, `Certificate-${domainName}`, {
				certificateName: `Certificate-${domainName}`,
				domainName,
				validation: acm.CertificateValidation.fromDns(zoneProduction),
			});

			const certificateArns = getCertificateArns();
			certificateArns[domainName] = certificate.certificateArn;
			require('fs').writeFileSync(
				__dirname + '/./config/certificate-arns.json',
				JSON.stringify(certificateArns, null, 2),
			);
		});

		[
			// Domains need to be hard-coded rather than using contextProps values because otherwise certificate-arns.json ends up with the same pairs tokens used across all environments.
			'mapa.staging.keithmoss.me',
			'api.mapa.staging.keithmoss.me',
		].forEach((domainName) => {
			const certificate = new Certificate(this, `Certificate-${domainName}`, {
				certificateName: `Certificate-${domainName}`,
				domainName,
				validation: acm.CertificateValidation.fromDns(zoneStaging),
			});

			const certificateArns = getCertificateArns();
			certificateArns[domainName] = certificate.certificateArn;
			require('fs').writeFileSync(
				__dirname + '/./config/certificate-arns.json',
				JSON.stringify(certificateArns, null, 2),
			);
		});
	}
}
