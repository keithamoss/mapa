import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { getCertificateArns } from '../utils/utils';

export class GetCertificate {
	cert: Certificate;

	constructor(scope: Construct, props: { domainName: string }) {
		const certificateArns = getCertificateArns();

		const certificateArn = certificateArns[props.domainName];
		if (!certificateArn) {
			throw new Error(`Certificate ARN not found for domain name ${props.domainName}`);
		}

		const certName = `${props.domainName}-Cert`;

		this.cert = Certificate.fromCertificateArn(scope, certName, certificateArn) as Certificate;
	}
}
