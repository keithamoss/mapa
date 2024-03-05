export const getCertificateArns = () => {
	try {
		return require('./../config/certificate-arns.json');
	} catch (error) {
		return {};
	}
};

export const titleCase = (str: string) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
