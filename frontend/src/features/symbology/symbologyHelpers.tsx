import * as Sentry from '@sentry/react';
import {
	FeatureSchema,
	FeatureSchemaSymbology,
	FeatureSchemaSymbologySymbolsValue,
	SymbologyProps,
} from '../../app/services/schemas';

import { hextoRGBACSS } from '../../app/colourUtils';
import { isDevelopment } from '../../app/utils';
import { IconStyle } from './iconsLibrary';
import { getDefaultIconStyle, getIconByName, getIconSVG, isIconColourLocked } from './iconsLibraryHelpers';
import { parseAndManipulateSVGIcon } from './svgHelpers';

export const defaultSymbolIcon = 'location-question';
export const defaultMapHeroIcon = 'map-location-dot';
export const defaultMapHeroIconColour = '#7a7a7a';
export const defaultMapHeroIconOpacity = 0.4;
export const defaultSymbolIconSVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM105.8 133.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L216 232.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V218.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H158.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM160 320a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>';
export const defaultSymbolIconSVGPreStyled =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" aria-hidden="true" focusable="false" role="img" style="background-color: rgba(255, 255, 255, 0.012); transform: rotate(0deg);" color="rgba(229, 11, 11, 1)" width="27" height="27"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM105.8 133.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L216 232.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V218.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H158.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM160 320a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" fill="currentColor"/></svg>';
export const defaultSymbolIconStyle = 'solid';
export const defaultSymbolDarkenColourByPercentage = 10;
export const defaultSymbolColour = '#000000';
export const defaultSymbolSecondaryColour = '#989696';
export const defaultSymbolTertiaryColour = '#A6A6A6';
export const defaultSymbolModifierColour = '#FFFFFF';
export const defaultSymbolModifierSecondaryColour = '#989696';
export const defaultSymbolModifierCircleColour = '#000000';
export const defaultSymbolSize = 15;
export const defaultSymbolSizeForFormFields = 15;
// <input type="color" /> doesn't support opacity, so provide pure white for the form and very opaque black for the map
export const defaultSymbolFillColour = '#FFFFFF10'; // So the whole icon is draggable in OL
// export const defaultSymbolFillColourForSymbologyForm = "#FFFFFF"; // So the whole icon is draggable in OL
export const defaultSymbolRotation = 0;
export const defaultSymbolOpacity = 1;
export const defaultSymbolSecondaryOpacity = 0.4;
export const defaultSymbolTertiaryOpacity = 1;
export const defaultSymbolModifierOpacity = 1;
export const defaultSymbolModifierSecondaryOpacity = 1;
export const defaultSymbolModifierCircleOpacity = 1;

export const defaultSymbologyGroupId = 1;

export interface FontAwesomeIconSVGProps {
	colour: string;
	opacity: number;
	secondaryColour: string;
	secondaryOpacity: number;
	tertiaryColour: string;
	tertiaryOpacity: number;
	modifierIcon: string;
	modifierIconStyle: IconStyle | '';
	modifierColour: string;
	modifierOpacity: number;
	modifierSecondaryColour: string;
	modifierSecondaryOpacity: number;
	modifierCircleColour: string;
	modifierCircleOpacity: number;
	width: number;
	height: number;
	rotation: number;
	backgroundColour: string;
}

export const getAppDefaultSymbologyConfig = () =>
	({
		icon: defaultSymbolIcon,
		icon_style: defaultSymbolIconStyle,
		size: defaultSymbolSize,
		rotation: defaultSymbolRotation,
		colour: defaultSymbolColour,
		opacity: defaultSymbolOpacity,
		modifier_icon: undefined,
		modifier_icon_style: undefined,
		modifier_colour: defaultSymbolModifierColour,
		modifier_opacity: defaultSymbolModifierOpacity,
		modifier_secondary_colour: defaultSymbolModifierSecondaryColour,
		modifier_secondary_opacity: defaultSymbolModifierSecondaryOpacity,
		modifier_circle_colour: defaultSymbolModifierCircleColour,
		modifier_circle_opacity: defaultSymbolModifierCircleOpacity,
		secondary_colour: defaultSymbolSecondaryColour,
		secondary_opacity: defaultSymbolSecondaryOpacity,
		tertiary_colour: defaultSymbolTertiaryColour,
		tertiary_opacity: defaultSymbolTertiaryOpacity,
	}) as SymbologyProps;

export const getFontAwesomeIconFromLibrary = (
	iconProps: FontAwesomeIconSVGProps,
	iconName: string,
	iconStyle?: IconStyle,
) => {
	let svg, isColourLocked;
	const icon = getIconByName(iconName);

	if (icon !== null) {
		iconStyle = iconStyle || getDefaultIconStyle(icon);
		svg = getIconSVG(icon, iconStyle) || defaultSymbolIconSVG;
		isColourLocked = isIconColourLocked(icon, iconStyle);
	} else {
		iconStyle = defaultSymbolIconStyle;
		svg = defaultSymbolIconSVG;
		isColourLocked = false;
	}

	try {
		// Saves us having to do a lot of nested checking of undefineds from getElementsBy*() functions
		return parseAndManipulateSVGIcon(svg, iconProps, isColourLocked, iconStyle);
	} catch (error) {
		// Worst case scenario, we just display the default (?) icon
		Sentry.captureException(error);

		if (isDevelopment() === true) {
			// eslint-disable-next-line no-console
			console.error(error);
		}

		return defaultSymbolIconSVGPreStyled;
	}
};

export const getFontAwesomeIconProps = (symbol: Partial<SymbologyProps>): FontAwesomeIconSVGProps => {
	const opacity = symbol?.opacity !== undefined ? symbol?.opacity : defaultSymbolOpacity;

	return {
		colour: hextoRGBACSS(symbol?.colour || defaultSymbolColour, opacity),
		opacity,
		secondaryColour: hextoRGBACSS(
			symbol?.secondary_colour || defaultSymbolSecondaryColour,
			symbol?.secondary_opacity !== undefined ? symbol?.secondary_opacity : defaultSymbolSecondaryOpacity,
		),
		secondaryOpacity:
			symbol?.secondary_opacity !== undefined ? symbol?.secondary_opacity : defaultSymbolSecondaryOpacity, // Opacity is taken care of the
		tertiaryColour: hextoRGBACSS(
			symbol?.tertiary_colour || defaultSymbolTertiaryColour,
			symbol?.tertiary_opacity !== undefined ? symbol?.tertiary_opacity : defaultSymbolTertiaryOpacity,
		),
		tertiaryOpacity: symbol?.tertiary_opacity !== undefined ? symbol?.tertiary_opacity : defaultSymbolTertiaryOpacity, // Opacity is taken care of in the colour
		modifierIcon: symbol?.modifier_icon || '',
		modifierIconStyle: symbol?.modifier_icon_style || '',
		modifierColour: hextoRGBACSS(
			symbol?.modifier_colour || defaultSymbolModifierColour,
			symbol?.modifier_opacity !== undefined ? symbol?.modifier_opacity : defaultSymbolModifierOpacity,
		),
		modifierOpacity: symbol?.modifier_opacity !== undefined ? symbol?.modifier_opacity : defaultSymbolModifierOpacity, // Opacity is taken care of in the colour
		modifierSecondaryColour: hextoRGBACSS(
			symbol?.modifier_secondary_colour || defaultSymbolModifierSecondaryColour,
			symbol?.modifier_secondary_opacity !== undefined
				? symbol?.modifier_secondary_opacity
				: defaultSymbolModifierSecondaryOpacity,
		),
		modifierSecondaryOpacity:
			symbol?.modifier_secondary_opacity !== undefined
				? symbol?.modifier_secondary_opacity
				: defaultSymbolModifierSecondaryOpacity, // Opacity is taken care of in the colour
		modifierCircleColour: hextoRGBACSS(
			symbol?.modifier_circle_colour || defaultSymbolModifierCircleColour,
			symbol?.modifier_circle_opacity !== undefined
				? symbol?.modifier_circle_opacity
				: defaultSymbolModifierCircleOpacity,
		),
		modifierCircleOpacity:
			symbol?.modifier_circle_opacity !== undefined
				? symbol?.modifier_circle_opacity
				: defaultSymbolModifierCircleOpacity, // Opacity is taken care of on the colour
		width: symbol.size !== undefined ? symbol.size * 1.8 : defaultSymbolSize,
		height: symbol.size !== undefined ? symbol.size * 1.8 : defaultSymbolSize,
		rotation: symbol?.rotation || defaultSymbolRotation,
		backgroundColour: hextoRGBACSS(defaultSymbolFillColour), // Ensure transparent areas of the icon are draggable and clickable
	};
};

export const getFontAwesomeIconForSymbolAsSVGString = (
	symbol: Partial<SymbologyProps>,
	propOverrides?: Partial<SymbologyProps>,
) => {
	const { icon, icon_style, ...props } = symbol;

	if (icon === undefined) {
		return null;
	}

	const local_symbol = {
		...props,
		...propOverrides,
	};

	return getFontAwesomeIconFromLibrary(getFontAwesomeIconProps(local_symbol), icon, icon_style as IconStyle);
};

export const getFontAwesomeIconFromLibraryAsSVGImage = (
	iconName: string,
	iconStyle?: string,
	propOverrides?: Partial<SymbologyProps>,
) => (
	<img
		alt={iconName}
		src={`data:image/svg+xml;utf8,${getFontAwesomeIconFromLibrary(
			getFontAwesomeIconProps(propOverrides || {}),
			iconName,
			iconStyle as IconStyle,
		)}`}
	/>
);

export const getFontAwesomeIconForSymbolPreview = (
	symbol: Partial<SymbologyProps>,
	propOverrides?: Partial<SymbologyProps>,
) => {
	const { icon, icon_style, ...props } = symbol;

	if (icon === undefined) {
		return null;
	}

	const local_symbol = {
		...props,
		...propOverrides,
	};

	const svg = getFontAwesomeIconFromLibrary(getFontAwesomeIconProps(local_symbol), icon, icon_style as IconStyle);

	if (svg === null) {
		return null;
	}

	return <img alt={icon} src={`data:image/svg+xml;utf8,${svg}`} />;
};

export const getSymbolGroups = (symbology: FeatureSchemaSymbology) => Object.values(symbology.groups);

export const getSymbolsForGroup = (groupId: number, symbology: FeatureSchemaSymbology) =>
	Object.values(symbology.symbols).filter((s) => s.group_id === groupId);

export const getSymbologyGroupById = (groupId: number, symbology: FeatureSchemaSymbology) => {
	return symbology.groups.find((g) => g.id === groupId) || null;
};

export const getNextSymbologyGroupId = (symbology: FeatureSchemaSymbology) => {
	if (symbology.groups.length === 0) {
		return 1;
	}
	return Math.max(...symbology.groups.map((group) => group.id)) + 1;
};

export const getNextSymbologySymbolId = (symbology: FeatureSchemaSymbology) => {
	if (symbology.symbols.length === 0) {
		return 1;
	}
	return Math.max(...symbology.symbols.map((symbol) => symbol.id)) + 1;
};

export const addNewSymbologyGroup = (groupName: string, symbology: FeatureSchemaSymbology) => {
	const nextId = getNextSymbologyGroupId(symbology);
	const local_symbology: FeatureSchemaSymbology = {
		...symbology,
		groups: [
			...symbology.groups,
			{
				id: nextId,
				name: groupName,
			},
		],
	};
	return {
		id: nextId,
		symbology: local_symbology,
	};
};

export const editSymbologyGroup = (groupId: number, groupName: string, symbology: FeatureSchemaSymbology) => {
	const local_symbology: FeatureSchemaSymbology = { ...symbology };

	const groupIdx = symbology.groups.findIndex((symbologyGroup) => symbologyGroup.id === groupId);

	if (groupIdx !== -1 && groupIdx in local_symbology.groups) {
		local_symbology.groups[groupIdx] = {
			...local_symbology.groups[groupIdx],
			name: groupName,
		};
	}

	return local_symbology;
};

export const deleteSymbologyGroup = (groupId: number, symbology: FeatureSchemaSymbology) => {
	const local_symbology: FeatureSchemaSymbology = { ...symbology };

	if (getSymbolsForGroup(groupId, symbology).length === 0) {
		local_symbology.groups = local_symbology.groups.filter((g) => g.id !== groupId);
	}

	return local_symbology;
};

export const addSymbolToGroup = (
	symbol: SymbologyProps,
	symbology: FeatureSchemaSymbology,
	groupId: number,
): [FeatureSchemaSymbology, number] => {
	const newSymbolId = getNextSymbologySymbolId(symbology);
	return [
		{
			...symbology,
			symbols: [
				...symbology.symbols,
				{
					id: newSymbolId,
					group_id: groupId,
					props: symbol,
					favourited_map_ids: [],
				},
			],
		},
		newSymbolId,
	];
};

export const addSymbolToGroupAfterSymbol = (
	symbol: SymbologyProps,
	symbology: FeatureSchemaSymbology,
	groupId: number,
	symbolIdToAddAfter: number,
): [FeatureSchemaSymbology, number] => {
	const symbolIdx = symbology.symbols.findIndex((s) => s.id === symbolIdToAddAfter);

	if (symbolIdx !== -1) {
		const newSymbolId = getNextSymbologySymbolId(symbology);
		return [
			{
				...symbology,
				symbols: [
					...symbology.symbols.slice(0, symbolIdx + 1),
					{
						id: newSymbolId,
						group_id: groupId,
						props: symbol,
						favourited_map_ids: [],
					},
					...symbology.symbols.slice(symbolIdx + 1),
				],
			},
			newSymbolId,
		];
	}

	// If for some reason we can't find the symbol to reference, just add it to the end of the list
	return addSymbolToGroup(symbol, symbology, groupId);
};

export const modifySymbolInGroup = (symbol: FeatureSchemaSymbologySymbolsValue, symbology: FeatureSchemaSymbology) => {
	const symbolIdx = symbology.symbols.findIndex((s) => s.id === symbol.id);

	if (symbolIdx !== -1 && symbolIdx in symbology.symbols) {
		return {
			...symbology,
			symbols: symbology.symbols.map((s, idx) => (idx === symbolIdx ? symbol : s)),
		};
	}

	return symbology;
};

export const moveSymbolsToGroup = (symbolIds: number[], groupId: number, symbology: FeatureSchemaSymbology) => ({
	...symbology,
	symbols: symbology.symbols.map((symbol) =>
		symbolIds.includes(symbol.id) === true ? { ...symbol, group_id: groupId } : symbol,
	),
});

// export const modifySymbolProps = (
//   symbol: SymbologyProps,
//   symbology: FeatureSchemaSymbology,
//   symbolId: number
// ) => {
//   const local_symbology = { ...symbology };

//   const symbolIdx = local_symbology.symbols.findIndex((s) => s.id === symbolId);

//   if (symbolIdx !== -1 && symbolIdx in local_symbology.symbols) {
//     local_symbology.symbols[symbolIdx] = {
//       ...local_symbology.symbols[symbolIdx],
//       props: symbol,
//     };
//   }

//   return local_symbology;
// };

export const removeSymbol = (symbolId: number, symbology: FeatureSchemaSymbology) => {
	const local_symbology: FeatureSchemaSymbology = {
		...symbology,
		symbols: symbology.symbols.filter((s) => s.id !== symbolId),
	};
	return local_symbology;
};

export const favouriteSymbolForMap = (symbolId: number, mapId: number, symbology: FeatureSchemaSymbology) => {
	const local_symbology: FeatureSchemaSymbology = { ...symbology };

	const symbolIdx = local_symbology.symbols.findIndex((s) => s.id === symbolId);

	if (symbolIdx !== -1 && symbolIdx in local_symbology.symbols) {
		local_symbology.symbols[symbolIdx] = {
			...local_symbology.symbols[symbolIdx],
			favourited_map_ids: [
				...local_symbology.symbols[symbolIdx].favourited_map_ids,
				...(local_symbology.symbols[symbolIdx].favourited_map_ids.includes(mapId) === false ? [mapId] : []),
			],
		};
	}

	return local_symbology;
};

export const unfavouriteSymbolForMap = (symbolId: number, mapId: number, symbology: FeatureSchemaSymbology) => {
	const local_symbology: FeatureSchemaSymbology = { ...symbology };

	const symbolIdx = local_symbology.symbols.findIndex((s) => s.id === symbolId);

	if (symbolIdx !== -1 && symbolIdx in local_symbology.symbols) {
		local_symbology.symbols[symbolIdx] = {
			...local_symbology.symbols[symbolIdx],
			favourited_map_ids: local_symbology.symbols[symbolIdx].favourited_map_ids.filter((id) => id !== mapId),
		};
	}

	return local_symbology;
};

export const getSymbolFromSchemaSymbology = (symbolId: number, symbology: FeatureSchemaSymbology) =>
	symbology.symbols.find((s) => s.id === symbolId);

export const getSymbolNameBySymbolId = (symbolId: number, schema: FeatureSchema) => {
	const symbol = getSymbolFromSchemaSymbology(symbolId, schema.symbology);

	return symbol !== undefined ? symbol.props.name : null;
};
