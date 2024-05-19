import { Stack } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { BaseStackProps } from './utils/stack-props';

export class UsEastCertificateStack extends Stack {
	constructor(scope: Construct, id: string, props: BaseStackProps) {
		super(scope, id, props);

		const zoneProduction = route53.HostedZone.fromLookup(this, 'USEastHostedZoneProduction', {
			domainName: 'mapa.keithmoss.me',
		});

		['mapa.keithmoss.me', 'api.mapa.keithmoss.me'].forEach((domainName) => {
			const certificate = new Certificate(this, `Certificate-${domainName}`, {
				certificateName: `Certificate-${domainName}`,
				domainName,
				validation: acm.CertificateValidation.fromDns(zoneProduction),
			});
		});

		const zoneStaging = route53.HostedZone.fromLookup(this, 'USEastHostedZoneStaging', {
			domainName: 'mapa.staging.keithmoss.me',
		});

		['mapa.staging.keithmoss.me', 'api.mapa.staging.keithmoss.me'].forEach((domainName) => {
			const certificate = new Certificate(this, `Certificate-${domainName}`, {
				certificateName: `Certificate-${domainName}`,
				domainName,
				validation: acm.CertificateValidation.fromDns(zoneStaging),
			});
		});
	}
}
