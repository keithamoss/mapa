import { upperFirst } from 'lodash-es';
import MiniSearch, { SearchResult } from 'minisearch';
import { defaultSymbolIconStyle } from './symbologyHelpers';

import {
	FontAwesomeCategory,
	IFontAwesomeIcon,
	IFontAwesomeIcons,
	IconStyle,
	getCategories,
	getIcons,
} from './iconsLibrary';

export const getCategoryByName = (categoryName: string) => {
	const categories = getCategories();

	return categoryName in categories ? categories[categoryName as FontAwesomeCategory] : null;
};

export const getCategoryLabelByName = (categoryName: string) => {
	const category = getCategoryByName(categoryName);
	return category !== null ? category.label : null;
};

export interface IFontAwesomeIconsByCategory {
	icon: IFontAwesomeIcon;
	category: {
		name: string;
		label: string;
	};
}

export const getIconByName = (iconName: string) => {
	const icons = getIcons();
	if (iconName in icons) {
		return {
			...icons[iconName],
			name: iconName,
		} as IFontAwesomeIcon;
	}
	return null;
};

export const getIconLabelByName = (iconName: string) => {
	const icon = getIconByName(iconName);
	return icon !== null ? icon.label : 'Unnamed icon';
};

export interface IconSearchResult extends SearchResult {
	id: number;
	name: string;
	label: string;
	'search.terms': string[];
	categories: string[];
}

export const searchIcons = (
	searchTerm: string,
	categoryName?: string,
	boostCircularModifierIcons: boolean = false,
	iconNamesAvailableToSearch?: string[],
) => {
	const icons = categoryName === undefined ? getIcons() : getIconsForCategoryIndexedByIconName(categoryName);

	const miniSearch = new MiniSearch({
		idField: 'name',
		fields: ['label', 'search.terms', 'categories'], // Fields to index for full-text search
		storeFields: ['name', 'label', 'search.terms', 'categories'], // Fields to return with search results
		searchOptions: {
			boost: { label: 5, name: 3, categories: 1.5 }, // Fields to boost in the results (label gets highest priority)
			// documentId is the icon name
			boostDocument: (documentId) =>
				boostCircularModifierIcons === true &&
				typeof documentId === 'string' &&
				isCircularModifierIcon(documentId) === true
					? 3
					: 1,
			prefix: true, // Prefix search (so that 'moto' will match 'motorcycle')
			combineWith: 'AND', // Combine terms with AND, not OR
			// Fuzzy search with a max edit distance of 0.2 * term length,
			// rounded to nearest integer. The mispelled 'ismael' will match 'ishmael'.
			// fuzzy: 0.2,
		},
		// Access nested fields (and regular top-level fields)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
		extractField: (document, fieldName) => fieldName.split('.').reduce((doc, key) => doc && doc[key], document),
	});

	// Index documents
	if (iconNamesAvailableToSearch === undefined) {
		miniSearch.addAll(Object.values(icons));
	} else {
		miniSearch.addAll(Object.values(icons).filter((icon) => iconNamesAvailableToSearch.includes(icon.name)));
	}

	return miniSearch.search(searchTerm) as IconSearchResult[];
};

export const getIconsForCategory = (categoryName: string) => {
	const categories = getCategories();
	const icons: IFontAwesomeIcon[] = [];

	if (categories[categoryName as FontAwesomeCategory] !== undefined) {
		categories[categoryName as FontAwesomeCategory].icons.forEach((iconName: string) => {
			const icon = getIconByName(iconName);

			if (icon !== null) {
				icons.push(icon);
			}
		});
	}

	return icons;
};

export const getIconsForCategoryIndexedByIconName = (categoryName: string) => {
	const icons: IFontAwesomeIcons = {};
	getIconsForCategory(categoryName).forEach((icon) => (icons[icon.name] = icon));
	return icons;
};

export const isIconStyleDuotoneOrTritone = (iconStyle?: IconStyle) =>
	[
		'duotone',
		// 'tritone',
		// 'tritone-regular',
	].includes(iconStyle || '');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isIconStyleTritone = (iconStyle?: IconStyle) => false;
// export const isIconStyleTritone = (iconStyle?: IconStyle) =>
// 	['tritone', 'tritone-regular'].includes(iconStyle || '');

export const isIconStyleColoured = (iconStyle?: IconStyle) =>
	['coloured', 'coloured-outlined'].includes(iconStyle || '');

// When we return to allowing the user to change colours on coloured icons, there's
// a bunch of code to uncomment and revisit.
// See all comments that say:
// "See note in getAvailableStylesForIcon()"
export const getAvailableStylesForIcon = (iconName?: string) => {
	if (iconName !== undefined) {
		const icon = getIconByName(iconName);

		if (icon !== null) {
			const styles: IconStyle[] = [];

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			Object.entries(icon.svgs).forEach(([iconStyle, iconStyleDefinition]) => {
				styles.push(iconStyle as IconStyle);

				// This wasn't a great way of doing the differentiator between FontAwesome's duotone style and the FlatIcon icons that had two colours.
				// When we come back to customising the colours on FlatIcon icons, reevisit the implementation and make it cleaner in a way that doesn't
				// involve us hacking things into the style name.
				// c.f. getColourFromSVGOrDefaultForSymbologyFieldOnIconOrIconStyleChange()
				// if (iconStyleDefinition.has_colours === true) {
				// 	styles.push(`${iconStyle}-coloured` as IconStyle);
				// }
			});

			return styles;
		}
	}

	return [];
};

export const getDefaultStyleByIconName = (iconName: string) => {
	const icon = getIconByName(iconName);
	if (icon === null) {
		return defaultSymbolIconStyle;
	}

	return getDefaultIconStyle(icon);
};

export const getDefaultIconStyle = (icon: IFontAwesomeIcon): IconStyle => {
	if ('coloured' in icon.svgs) {
		return 'coloured';
	}

	if ('coloured-outlined' in icon.svgs) {
		return 'coloured-outlined';
	}

	if (defaultSymbolIconStyle in icon.svgs) {
		return defaultSymbolIconStyle;
	}

	return Object.keys(icon.svgs)[0] as IconStyle;
};

export const getIconSVG = (icon: IFontAwesomeIcon, iconStyle?: IconStyle) => {
	if (iconStyle !== undefined) {
		// See note in getAvailableStylesForIcon()
		const iconStyleSansColoured = iconStyle.replace('-coloured', '') as IconStyle;
		if (icon.svgs[iconStyleSansColoured] !== undefined) {
			const iconSVGDefinition = icon.svgs[iconStyleSansColoured];
			if (iconSVGDefinition !== undefined) {
				return iconSVGDefinition.svg;
			}
		}
	}

	return undefined;
};

export const isIconColourLocked = (icon: IFontAwesomeIcon, iconStyle?: IconStyle) => {
	if (iconStyle !== undefined) {
		// See note in getAvailableStylesForIcon()
		const iconStyleSansColoured = iconStyle.replace('-coloured', '') as IconStyle;
		if (icon.svgs[iconStyleSansColoured] !== undefined) {
			const iconSVGDefinition = icon.svgs[iconStyleSansColoured];
			if (iconSVGDefinition !== undefined) {
				return iconSVGDefinition.colour_locked || false;
			}
		}
	}

	return false;
};

export const isIconColourLockedByName = (iconName: string, iconStyle?: IconStyle) => {
	const icon = getIconByName(iconName);
	return icon !== null ? isIconColourLocked(icon, iconStyle) : false;
};

export const getIconStyleName = (icon_style: IconStyle) =>
	icon_style
		.split('-')
		.map((s) => upperFirst(s))
		.join(' ');

export const getCategoryLabelsForIconNames = (iconNames: string[]) => {
	let categories: string[] = [];

	iconNames.forEach((iconName: string) => {
		const icon = getIconByName(iconName);
		if (icon !== null) {
			categories = [...categories, ...icon.categories];
		}
	});

	return Array.from(new Set(categories));
};

export const findIconsAvailableForUseAsModifiers = () => {
	const icons = getIcons();
	const modifiers: IFontAwesomeIcon[] = [];

	const denyList = [
		'circle-dollar-to-slot',
		'circle-exclamation-check',
		'circle-nodes',
		'circle-parking',
		'circle-quarter',
		'circle-quarter-stroke',
		'circle-quarters',
		'circle-small',
		'circle-three-quarters',
		'circle-three-quarters-stroke',
		'circle-radiation',
		'circle-dashed',
		'circle-half',
		'circle-half-stroke',
		'circle-notch',
		'circles-overlap',
		'circle-wifi-circle-wifi',
	];

	const allowList = ['circle', 'pen-circle'];

	Object.keys(icons)
		.filter(
			(iconName) =>
				(iconName.startsWith('circle') || allowList.includes(iconName)) && denyList.includes(iconName) === false,
		)
		.forEach((iconName) => {
			const icon = getIconByName(iconName);
			if (icon !== null) {
				modifiers.push(icon);
			}
		});

	return modifiers.map((icon) => icon.name);
};

export const isCircularModifierIcon = (iconName: string) => getCircularModifierIconNames().includes(iconName) === true;

// Created using findIconsAvailableForUseAsModifiers() and manual review
export const getCircularModifierIconNames = () => [
	'circle',
	'circle-0',
	'circle-1',
	'circle-2',
	'circle-3',
	'circle-4',
	'circle-5',
	'circle-6',
	'circle-7',
	'circle-8',
	'circle-9',
	'circle-a',
	'circle-ampersand',
	'circle-arrow-down',
	'circle-arrow-down-left',
	'circle-arrow-down-right',
	'circle-arrow-left',
	'circle-arrow-right',
	'circle-arrow-up',
	'circle-arrow-up-left',
	'circle-arrow-up-right',
	'circle-b',
	'circle-bolt',
	'circle-book-open',
	'circle-bookmark',
	'circle-c',
	'circle-calendar',
	'circle-camera',
	'circle-caret-down',
	'circle-caret-left',
	'circle-caret-right',
	'circle-caret-up',
	'circle-check',
	'circle-chevron-down',
	'circle-chevron-left',
	'circle-chevron-right',
	'circle-chevron-up',
	'circle-d',
	'circle-divide',
	'circle-dollar',
	'circle-dot',
	'circle-down',
	'circle-down-left',
	'circle-down-right',
	'circle-e',
	'circle-ellipsis',
	'circle-ellipsis-vertical',
	'circle-envelope',
	'circle-euro',
	'circle-exclamation',
	'circle-f',
	'circle-g',
	'circle-gf',
	'circle-h',
	'circle-heart',
	'circle-i',
	'circle-info',
	'circle-j',
	'circle-k',
	'circle-l',
	'circle-left',
	'circle-location-arrow',
	'circle-m',
	'circle-microphone',
	'circle-microphone-lines',
	'circle-minus',
	'circle-n',
	'circle-o',
	'circle-p',
	'circle-pause',
	'circle-phone',
	'circle-phone-flip',
	'circle-phone-hangup',
	'circle-play',
	'circle-plus',
	'circle-q',
	'circle-question',
	'circle-r',
	'circle-right',
	'circle-s',
	'circle-sort',
	'circle-sort-down',
	'circle-sort-up',
	'circle-star',
	'circle-sterling',
	'circle-stop',
	'circle-t',
	'circle-trash',
	'circle-u',
	'circle-up',
	'circle-up-left',
	'circle-up-right',
	'circle-user',
	'circle-v',
	'circle-video',
	'circle-w',
	'circle-waveform-lines',
	'circle-wifi',
	'circle-x',
	'circle-xmark',
	'circle-y',
	'circle-yen',
	'circle-z',
	'pen-circle',
];
