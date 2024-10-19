import type { FeatureDataItemURLFieldLinkItem } from '../../../app/services/features';

export const addLinkToURLField = (
	urlFieldLinkItem: FeatureDataItemURLFieldLinkItem,
	urlField: FeatureDataItemURLFieldLinkItem[],
) => [...urlField, urlFieldLinkItem];

export const modifyLinkInURLField = (
	urlFieldLinkItem: FeatureDataItemURLFieldLinkItem,
	urlField: FeatureDataItemURLFieldLinkItem[],
) => urlField.map((l) => (l.id === urlFieldLinkItem.id ? urlFieldLinkItem : l));

export const removeLinkFromURLField = (linkId: string, urlField: FeatureDataItemURLFieldLinkItem[]) =>
	urlField.filter((l) => l.id !== linkId);

export const moveLinkUpInURLField = (linkId: string, urlField: FeatureDataItemURLFieldLinkItem[]) => {
	const fieldIdx = urlField.findIndex((f) => f.id === linkId);

	if (fieldIdx !== -1 && fieldIdx > 0) {
		const localURLField = [...(urlField || [])];
		const field = localURLField.splice(fieldIdx, 1)[0];
		const toFieldIdx = fieldIdx - 1;

		localURLField.splice(toFieldIdx, 0, field);

		return localURLField;
	}

	return null;
};

export const moveLinkDownInURLField = (linkId: string, urlField: FeatureDataItemURLFieldLinkItem[]) => {
	const fieldIdx = urlField.findIndex((f) => f.id === linkId);

	if (fieldIdx !== -1 && fieldIdx < urlField.length - 1) {
		const localURLField = [...(urlField || [])];
		const field = localURLField.splice(fieldIdx, 1)[0];
		const toFieldIdx = fieldIdx + 1;

		localURLField.splice(toFieldIdx, 0, field);

		return localURLField;
	}

	return null;
};
