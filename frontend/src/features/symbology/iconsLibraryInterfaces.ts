import { IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeCategory } from './icons-categories-library';

export interface IFontAwesomeIcons {
	[key: string]: IFontAwesomeIcon;
}

export type IFontAwesomeCategories = {
	[key in FontAwesomeCategory]: {
		name: FontAwesomeCategory;
		label: string;
		hero_icon: string;
		icons: IconName[];
	};
};
export type IconColourLevels = 'primary' | 'secondary' | 'tertiary';

export type IconStyle =
	// # FontAwesome and FlatIcon
	| 'solid'
	// # FontAwesome Only
	| 'regular'
	| 'light'
	| 'thin'
	| 'duotone'
	// | 'tritone'
	// | 'tritone-regular'
	| 'sharp-solid'
	| 'sharp-regular'
	| 'sharp-light'
	| 'sharp-thin'
	| 'brands'
	// # FlatIcon Only
	| 'coloured'
	| 'coloured-outlined'
	| 'outlined';

export interface IFontAwesomeIcon {
	name: IconName;
	label: string;
	categories: string[];
	search: {
		terms: string[];
	};
	svgs: Partial<
		Record<
			IconStyle,
			{
				colour_locked?: boolean;
				svg: string;
			}
		>
	>;
}
