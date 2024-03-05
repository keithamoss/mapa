import { Stack } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { StackPropsWithContextEnv } from './utils/get-env-context';
import { getCertificateArns } from './utils/utils';

export class UsEastCertificateStack extends Stack {
	constructor(scope: Construct, id: string, props: StackPropsWithContextEnv) {
		// https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html#typescript-cdk-idioms
		const { context: contextProps, ...ogProps } = props;
		super(scope, id, ogProps);

		const zone = route53.HostedZone.fromLookup(this, 'USEastHostedZone', {
			domainName: contextProps.domainName,
		});

		[contextProps.domainName, contextProps.domainNameDjangoApp].forEach((domainName) => {
			const certificate = new Certificate(this, `Certificate-${domainName}`, {
				certificateName: `Certificate-${domainName}`,
				domainName,
				validation: acm.CertificateValidation.fromDns(zone),
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
