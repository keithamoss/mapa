import * as Sentry from '@sentry/react';
import * as yup from 'yup';
import type { ObjectSchema } from 'yup';
import { getIconByName, getIconSVG, isIconStyleColoured } from '../../features/symbology/iconsLibraryHelpers';
import type { IconColourLevels, IconStyle } from '../../features/symbology/iconsLibraryInterfaces';
import { defaultSymbolIconSVG } from '../../features/symbology/symbologyHelpers';
import type { SymbologyProps } from '../services/schemas';
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
			icon_style: iconFieldRequired === true ? yup.string<IconStyle>().required() : yup.string<IconStyle>().optional(),
			colour: colourOptional,
			opacity: positiveFloatOptional.min(0, 'Must be 0 or larger').max(1, 'Must be 1 or smaller'),
			secondary_colour: colourOptional,
			secondary_opacity: positiveFloatOptional.min(0, 'Must be 0 or larger').max(1, 'Must be 1 or smaller'),
			tertiary_colour: colourOptional,
			tertiary_opacity: positiveFloatOptional.min(0, 'Must be 0 or larger').max(1, 'Must be 1 or smaller'),
			modifier_icon: yup.string().optional(),
			modifier_icon_style: yup.string<IconStyle>().when('modifier_icon', {
				is: (val: string | undefined) => typeof val === 'string' && val.length > 0,
				then: (schema) => schema.required(),
				otherwise: (schema) => schema.optional(),
			}),
			modifier_colour: colourOptional,
			modifier_opacity: positiveFloatOptional.min(0, 'Must be 0 or larger').max(1, 'Must be 1 or smaller'),
			modifier_secondary_colour: colourOptional,
			modifier_secondary_opacity: positiveFloatOptional.min(0, 'Must be 0 or larger').max(1, 'Must be 1 or smaller'),
			modifier_circle_colour: colourOptional,
			modifier_circle_opacity: positiveFloatOptional.min(0, 'Must be 0 or larger').max(1, 'Must be 1 or smaller'),
			size: positiveIntegerOptional.min(symbolMinimumSize).max(symbolMaximumSize),
			rotation: positiveIntegerOptional.min(0, 'Must be 0 or larger').max(360, 'Must be 360 or smaller'),
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

export const getColourFromSVGOrDefaultForSymbologyField = (
	symbol: Partial<SymbologyProps> | null | undefined,
	fieldName: keyof SymbologyProps,
	colourLevel: IconColourLevels,
	iconName: string,
	iconStyle: IconStyle,
	defaultValue: string,
) => {
	// If we're not using the inbuilt colours, just grab the colour from the symbol.
	// Using !== true because we only include has_coloured if there are colours, not
	// in the absence of colours.
	if (isIconStyleColoured(iconStyle) !== true) {
		return getStringOrDefaultForSymbologyField(symbol, fieldName, defaultValue);
	}

	// However, if we are using the inbuilt colours we need to parse the SVG to extract the hex code for the given colour level

	// Again, let's revisit this when we get back around to allowing colour customisation. Maybe this is fine, but maybe we want
	// it built into the icon library JSON.
	// c.f. getAvailableStylesForIcon()
	return defaultValue;
	// return getColourFromSVGOrDefault(colourLevel, iconName, iconStyle, defaultValue);
};

export const getColourFromSVGOrDefaultForSymbologyFieldOnIconOrIconStyleChange = (
	colourLevel: IconColourLevels,
	iconName: string,
	iconStyle: IconStyle,
	defaultValue: string,
) => {
	// If we're not using the inbuilt colours, just grab the colour from the symbol.
	// Using !== true because we only include has_coloured if there are colours, not
	// in the absence of colours.
	if (isIconStyleColoured(iconStyle) !== true) {
		return defaultValue;
	}

	// However, if we are using the inbuilt colours we need to parse the SVG to extract the hex code for the given colour level

	// Again, let's revisit this when we get back around to allowing colour customisation. Maybe this is fine, but maybe we want
	// it built into the icon library JSON.
	// c.f. getAvailableStylesForIcon()
	return defaultValue;
	// return getColourFromSVGOrDefault(colourLevel, iconName, iconStyle, defaultValue);
};

export const getColourFromSVGOrDefault = (
	colourLevel: IconColourLevels,
	iconName: string,
	iconStyle: IconStyle,
	defaultValue: string,
) => {
	let svg: string | undefined = undefined;

	const icon = getIconByName(iconName);
	if (icon !== null) {
		svg = getIconSVG(icon, iconStyle) || defaultSymbolIconSVG;
	}

	if (svg !== undefined) {
		try {
			const svgDOMElement = new DOMParser().parseFromString(svg, 'image/svg+xml');

			for (const pathElement of svgDOMElement.getElementsByTagName('path')) {
				if (
					(colourLevel === 'primary' &&
						(pathElement.getAttribute('class') === 'primary' || pathElement.getAttribute('class') === null)) ||
					(colourLevel === 'secondary' && pathElement.getAttribute('class') === 'secondary') ||
					(colourLevel === 'tertiary' && pathElement.getAttribute('class') === 'tertiary')
				) {
					return pathElement.getAttribute('fill') || defaultValue;
				}
			}
		} catch (error) {
			// Worst case scenario, we just display the default (?) icon
			Sentry.captureException(error);
			return defaultValue;
		}
	}

	return defaultValue;
};
