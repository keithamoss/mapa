import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import { SymbologyProps } from '../services/schemas';
import { colourOptional, positiveFloatOptional, positiveIntegerOptional } from './yupValidation';

export const symbolMinimumSize = 1;
export const symbolMaximumSize = 50;
export const symbolMinimumRotation = 0;
export const symbolMaximumRotation = 360;
export const symbolMinimumOpacity = 0;
export const symbolMaximumOpacity = 1;

export const symbologyFormValidationSchema = (
	nameFieldRequired: boolean,
	iconFieldRequired: boolean,
): ObjectSchema<SymbologyProps> =>
	yup
		.object({
			name: nameFieldRequired === true ? yup.string().required() : yup.string().optional(),
			icon: iconFieldRequired === true ? yup.string().required() : yup.string().optional(),
			// We could strictly check IconStyle (and in schemas.ts), but we'd need to maintain
			// our own const(feeding the type and type array) of IconStyles, so meh for now.
			icon_style: iconFieldRequired === true ? yup.string().required() : yup.string().optional(),
			icon_family: iconFieldRequired === true ? yup.string().required() : yup.string().optional(),
			size: positiveIntegerOptional.min(symbolMinimumSize).max(symbolMaximumSize),
			rotation: positiveIntegerOptional.min(0, 'Must be 0 or larger').max(360, 'Must be 360 or smaller'),
			colour: colourOptional,
			opacity: positiveFloatOptional.min(0, 'Must be 0 or larger').max(1, 'Must be 1 or smaller'),
			secondary_colour: colourOptional,
			secondary_opacity: positiveFloatOptional.min(0, 'Must be 0 or larger').max(1, 'Must be 1 or smaller'),
		})
		.required();

export const getNumberOrDefaultForSymbologyField = (
	symbol: Partial<SymbologyProps> | null | undefined,
	fieldName: keyof SymbologyProps,
	defaultValue: number,
) => {
	const value =
		symbol === undefined || symbol === null || symbol[fieldName] === undefined ? undefined : symbol[fieldName];

	if (typeof value === 'number') {
		return value;
	} else if (typeof value === 'string') {
		return Number.parseInt(value);
	}
	return defaultValue;
};

export const getNumberOrUndefinedForSymbologyField = (
	symbol: Partial<SymbologyProps> | null | undefined,
	fieldName: keyof SymbologyProps,
) => {
	const value =
		symbol === undefined || symbol === null || symbol[fieldName] === undefined ? undefined : symbol[fieldName];

	if (typeof value === 'number') {
		return value;
	} else if (typeof value === 'string') {
		return Number.parseInt(value);
	}
	return undefined;
};

export const getStringOrUndefinedForSymbologyField = (
	symbol: Partial<SymbologyProps> | null | undefined,
	fieldName: keyof SymbologyProps,
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
) => (symbol === undefined || symbol === null || symbol[fieldName] === undefined ? undefined : `${symbol[fieldName]}`);

export const getStringOrEmptyStringForSymbologyField = (
	symbol: Partial<SymbologyProps> | null | undefined,
	fieldName: keyof SymbologyProps,
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
) => (symbol === undefined || symbol === null || symbol[fieldName] === undefined ? '' : `${symbol[fieldName]}`);

export const getStringOrDefaultForSymbologyField = (
	symbol: Partial<SymbologyProps> | null | undefined,
	fieldName: keyof SymbologyProps,
	defaultValue: string,
) =>
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	symbol === undefined || symbol === null || symbol[fieldName] === undefined ? defaultValue : `${symbol[fieldName]}`;
