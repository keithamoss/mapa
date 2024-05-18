import { Stack } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { BaseStackProps } from './utils/get-context';

export class UsEastCertificateStack extends Stack {
	constructor(scope: Construct, id: string, props: BaseStackProps) {
		super(scope, id, props);

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
		});
	}
}
