import MiniSearch from 'minisearch';

// eslint-disable-next-line import/named
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { upperFirst } from 'lodash-es';
import { defaultSymbolIconFamily, defaultSymbolIconStyle } from '../symbologyHelpers';

import categories from './pro/categories-processed.json';
import icons from './pro/icon-families-processed.json';

export type IconFamily = 'classic' | 'sharp' | 'duotone' | 'brands';
export type IconStyle = 'solid' | 'regular' | 'light' | 'thin' | 'duotone' | 'brands';

export type FontAwesomeCategory =
	| 'accessibility'
	| 'alert'
	| 'alphabet'
	| 'animals'
	| 'arrows'
	| 'astronomy'
	| 'automotive'
	| 'buildings'
	| 'business'
	| 'camping'
	| 'charity'
	| 'charts-diagrams'
	| 'childhood'
	| 'clothing-fashion'
	| 'coding'
	| 'communication'
	| 'connectivity'
	| 'construction'
	| 'design'
	| 'devices-hardware'
	| 'disaster'
	| 'editing'
	| 'education'
	| 'emoji'
	| 'energy'
	| 'files'
	| 'film-video'
	| 'food-beverage'
	| 'fruits-vegetables'
	| 'gaming'
	| 'gender'
	| 'halloween'
	| 'hands'
	| 'holidays'
	| 'household'
	| 'humanitarian'
	| 'logistics'
	| 'maps'
	| 'maritime'
	| 'marketing'
	| 'mathematics'
	| 'media-playback'
	| 'medical-health'
	| 'money'
	| 'moving'
	| 'music-audio'
	| 'nature'
	| 'numbers'
	| 'photos-images'
	| 'political'
	| 'punctuation-symbols'
	| 'religion'
	| 'science'
	| 'science-fiction'
	| 'security'
	| 'shapes'
	| 'shopping'
	| 'social'
	| 'spinners'
	| 'sports-fitness'
	| 'text-formatting'
	| 'time'
	| 'toggle'
	| 'transportation'
	| 'travel-hotel'
	| 'users-people'
	| 'weather'
	| 'writing';

export type IFontAwesomeCategories = {
	[key in FontAwesomeCategory]: {
		name: FontAwesomeCategory;
		label: string;
		hero_icon: string;
		icons: IconName[];
	};
};

export const getCategories = () => categories as IFontAwesomeCategories;

export const getCategoryByName = (categoryName: string) => {
	const categories = getCategories();

	return categoryName in categories ? categories[categoryName as FontAwesomeCategory] : null;
};

export const getCategoryLabelByName = (categoryName: string) => {
	const category = getCategoryByName(categoryName);
	return category !== null ? category.label : null;
};

export interface IconFamilyStyle {
	family: IconFamily;
	style: IconStyle;
}

type IconFamilyClassicStyles = 'solid' | 'regular' | 'light' | 'thin';
type IconFamilyBrandsStyles = 'brands';
type IconFamilyDuotoneStyles = 'solid';
type IconFamilySharpStyles = 'solid' | 'regular' | 'light';

export interface IFontAwesomeIcon {
	name: IconName;
	label: string;
	categories: string[];
	search: {
		terms: string[];
	};
	svgs: {
		classic?: {
			solid: string;
			regular: string;
			light: string;
			thin: string;
		};
		brands?: {
			brands: string;
		};
		duotone?: {
			solid: string;
		};
		sharp?: {
			solid: string;
			regular: string;
			light: string;
		};
	};
	familyStyles: IconFamilyStyle[];
}

export interface IFontAwesomeIcons {
	[key: string]: IFontAwesomeIcon;
}

export interface IFontAwesomeIconsByCategory {
	icon: IFontAwesomeIcon;
	category: {
		name: string;
		label: string;
	};
}

export const getIcons = () => icons as IFontAwesomeIcons;

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

export interface IconSearchResult {
	id: string;
	match: {
		[key: string]: string[];
	};
	score: number;
	terms: string[];
	name: string;
	label: string;
	'search.terms': string[];
	categories: string[];
}

export const searchIcons = (searchTerm: string, categoryName?: string, iconNamesAvailableToSearch?: string[]) => {
	const icons = categoryName === undefined ? getIcons() : getIconsForCategoryIndexedByIconName(categoryName);

	const miniSearch = new MiniSearch({
		idField: 'name',
		fields: ['label', 'search.terms', 'categories'], // Fields to index for full-text search
		storeFields: ['name', 'label', 'search.terms', 'categories'], // Fields to return with search results
		searchOptions: {
			boost: { name: 3, categories: 1.5 }, // Fields to boost in the results
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

export const getAvailableStylesForIcon = (iconName?: string) =>
	iconName !== undefined ? getIconByName(iconName)?.familyStyles || [] : [];

export const getDefaultFamilyByIconName = (iconName: string) => {
	const icon = getIconByName(iconName);
	if (icon === null) {
		return defaultSymbolIconFamily;
	}

	return getDefaultFamilyForIcon(icon);
};

export const getDefaultFamilyForIcon = (icon: IFontAwesomeIcon) =>
	'classic' in icon.svgs ? 'classic' : (Object.keys(icon.svgs)[0] as IconFamily);

export const getDefaultStyleByIconName = (iconName: string) => {
	const icon = getIconByName(iconName);
	if (icon === null) {
		return defaultSymbolIconStyle;
	}

	return getDefaultStyleForIcon(icon);
};

export const getDefaultStyleForIcon = (icon: IFontAwesomeIcon) => {
	if (icon.svgs.classic !== undefined && icon.svgs.classic.solid !== undefined) {
		return 'solid';
	} else {
		return Object.keys(Object.keys(icon.svgs)[0])[0];
	}
};

export const getIconSVG = (icon: IFontAwesomeIcon, iconFamily?: IconFamily, iconStyle?: IconStyle) => {
	const localIconFamily = iconFamily !== undefined ? iconFamily : getDefaultFamilyForIcon(icon);

	const localIconStyle = iconStyle !== undefined ? iconStyle : getDefaultStyleForIcon(icon);

	if (localIconFamily === 'classic' && icon.svgs.classic !== undefined) {
		return icon.svgs.classic[localIconStyle as IconFamilyClassicStyles];
	} else if (localIconFamily === 'brands' && icon.svgs.brands !== undefined) {
		return icon.svgs.brands[localIconStyle as IconFamilyBrandsStyles];
	} else if (localIconFamily === 'duotone' && icon.svgs.duotone !== undefined) {
		return icon.svgs.duotone[localIconStyle as IconFamilyDuotoneStyles];
	} else if (localIconFamily === 'sharp' && icon.svgs.sharp !== undefined) {
		return icon.svgs.sharp[localIconStyle as IconFamilySharpStyles];
	}

	return undefined;
};

export const getIconFamilyAndStyleName = (icon_family: IconFamily, icon_style: IconStyle) =>
	icon_family === 'classic' ? upperFirst(icon_style) : `${upperFirst(icon_family)} ${upperFirst(icon_style)}`;

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

// Created using findIconsAvailableForUseAsModifiers() and manual review
export const getModifierIconNames = () => [
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
	'circle-x',
	'circle-xmark',
	'circle-y',
	'circle-yen',
	'circle-z',
	'pen-circle',
];
