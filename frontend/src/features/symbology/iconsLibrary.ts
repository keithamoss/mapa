import type { IFontAwesomeCategories } from './iconsLibraryInterfaces';

// Whilst not strictly true that (it can be undefiend), we don't actually load the main parts of the app until the icons library is loaded, so in practice it's never undefined.
export const getCategories = () => window.MapaNamespace.iconsLibrary.categories as IFontAwesomeCategories;

// Note that we don't have getIcons() any more. We've gotten rid of that to see if the (possible) memory usage issue (i.e. where the page forcibly reloads iteslf) will go away.
