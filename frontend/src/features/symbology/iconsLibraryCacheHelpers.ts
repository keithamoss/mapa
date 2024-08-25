import { getBaseURL } from '../../app/utils';

export const getJSONResourceViaFetch = async <T>(resourceURL: string) => {
	try {
		const response = await fetch(resourceURL);
		return response.ok === true ? ((await response.json()) as T) : undefined;
	} catch {
		return undefined;
	}
};

export const getJSONResourceFromCache = async <T>(cache: Cache, resourceURL: string) => {
	const response = await cache.match(resourceURL);
	return response !== undefined ? ((await response.json()) as T) : undefined;
};

export const pruneCache = async (cache: Cache, resourceURLsToKeep: string[]) => {
	for (const request of await cache.keys()) {
		if (resourceURLsToKeep.includes(request.url.replace(getBaseURL(), '')) === false) {
			cache.delete(request);
		}
	}
};

export const getAllResourcesFromAllCaches = async (cacheName?: string) => {
	// Get a list of all of the caches for this origin
	const cacheNames = cacheName === undefined ? await caches.keys() : [cacheName];
	const result = [];

	for (const name of cacheNames) {
		const cache = await caches.open(name);

		for (const request of await cache.keys()) {
			result.push(await cache.match(request));
		}
	}

	return result;
};

export const getAllResourcesFromCache = async (cacheName: string) => getAllResourcesFromAllCaches(cacheName);

export const purgeAllCaches = async () => {
	const cacheNames = await caches.keys();
	for (const cacheName of cacheNames) {
		caches.delete(cacheName);
	}
};
