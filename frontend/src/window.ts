import type { IFontAwesomeCategories, IFontAwesomeIcons } from './features/symbology/iconsLibraryInterfaces';

export interface MapaNamespace {
	iconsLibrary: {
		loaded: boolean;
		icons?: IFontAwesomeIcons;
		categories?: IFontAwesomeCategories;
	};
}

export const MapaNamespaceDefaults: MapaNamespace = {
	iconsLibrary: {
		loaded: false,
		icons: undefined,
		categories: undefined,
	},
};
