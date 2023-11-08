import { IconName } from '@fortawesome/fontawesome-svg-core';

import categories from './icons-categories-library.json';
import icons from './icons-library.json';

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
	| 'fruits-(coloured)'
	| 'vegetables-(coloured)'
	| 'fruits-vegetables'
	| 'gaming'
	| 'gender'
	| 'halloween'
	| 'hands'
	| 'herbs-and-spices-(coloured)'
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
	| 'nature-(coloured)'
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

export interface IFontAwesomeIcons {
	[key: string]: IFontAwesomeIcon;
}

export const getCategories = () => categories as IFontAwesomeCategories;

export const getIcons = () => icons as IFontAwesomeIcons;
