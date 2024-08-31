import { isCacheApiSupported } from '../../app/utils';
import { iconsLibraryCacheName, iconsLibraryCacheURL, iconsLibraryCategoriesCacheURL } from './iconsLibraryCache';
import { getJSONResourceFromCache, getJSONResourceViaFetch, pruneCache } from './iconsLibraryCacheHelpers';
import { IFontAwesomeCategories, IFontAwesomeIcons } from './iconsLibraryInterfaces';

// Ref for this file: https://web.dev/articles/cache-api-quick-guide

export const loadIconsLibrary = async () => {
	// These global-esque variables only get created once and get exported from the module for other modules to use
	// Ref: https://stackoverflow.com/a/49219874/7368493
	let icons: IFontAwesomeIcons | undefined = undefined;
	let categories: IFontAwesomeCategories | undefined = undefined;

	// During initial loading we'll start the heart loading indicator spinning to provide a subtle hint that we've moved from 'Loading all of the JavaSript' and into 'Loading the icons library'
	if (icons === undefined || categories === undefined) {
		const loaderHeart = document.getElementById('loader-heart');
		loaderHeart?.classList.add('spin');
	}

	if (isCacheApiSupported() === true) {
		const cache = await caches.open(iconsLibraryCacheName);

		// First up, let's just try and pull the library from our cache
		icons = await getJSONResourceFromCache<IFontAwesomeIcons>(cache, iconsLibraryCacheURL);
		categories = await getJSONResourceFromCache<IFontAwesomeCategories>(cache, iconsLibraryCategoriesCacheURL);

		// Secondly, if it's a cache miss we'll go ahead and hydrate our cache
		if (icons === undefined) {
			await cache.add(iconsLibraryCacheURL);
			icons = await getJSONResourceFromCache<IFontAwesomeIcons>(cache, iconsLibraryCacheURL);
		}

		if (categories === undefined) {
			await cache.add(iconsLibraryCategoriesCacheURL);
			categories = await getJSONResourceFromCache<IFontAwesomeCategories>(cache, iconsLibraryCategoriesCacheURL);
		}

		// Note: We don't worry about icons and categories being undefined past this point, App.tsx takes care of handling that error.

		// Lastly, let's prune any unnecessary resources from the cache.
		// i.e. Old versions of the icons library resources that are no longer needed.
		pruneCache(cache, [iconsLibraryCacheURL, iconsLibraryCategoriesCacheURL]);
	} else {
		// If the Cache API isn't supported, let's just fallback to the good 'ol fetch() API and rely on the brower's usual inbuilt caching mechanism for web requests
		icons = await getJSONResourceViaFetch<IFontAwesomeIcons>(iconsLibraryCacheURL);
		categories = await getJSONResourceViaFetch<IFontAwesomeCategories>(iconsLibraryCategoriesCacheURL);
	}

	if (icons !== undefined && categories !== undefined) {
		window.MapaNamespace.iconsLibrary.loaded = true;
		window.MapaNamespace.iconsLibrary.icons = icons;
		window.MapaNamespace.iconsLibrary.categories = categories;
	} else {
		// This shouldn't ever really happen, so let's happily throw an exception and let Sentry deal with showing its error dialog.
		// From what we can see, the only things that should cause this would be the files not existing or some as-yet-unknown issue with adding resources of this size to the cache on some platform.
		throw Error(
			`Error hydrating Icons Library Cache. Icons Library: ${icons !== undefined ? 'Loaded' : 'Not Loaded'}; Icons Library Categories: ${categories !== undefined ? 'Loaded' : 'Not Loaded'}`,
		);
	}
};
