import type { Params } from 'react-router-dom';

export const getIntegerParamOrUndefined = (params: Params<string>, paramName: string) => {
	if (params[paramName] !== undefined && params[paramName]?.match(/^\d+$/) !== null) {
		return Number.parseInt(params[paramName] || '');
	}
	return undefined;
};

export const getStringParamOrUndefined = (params: Params<string>, paramName: string) => {
	return params[paramName] || undefined;
};
