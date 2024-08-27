import { IFontAwesomeCategories, IFontAwesomeIcons } from './iconsLibraryInterfaces';
import { categories, icons } from './iconsLibraryLoader';

export const getCategories = () => categories as IFontAwesomeCategories;

export const getIcons = () => icons as IFontAwesomeIcons;
