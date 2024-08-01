// https://docs.mapbox.com/api/search/geocoding/#geocoding-response-object
export interface IMapboxGeocodingAPIResponse {
	type: 'FeatureCollection';
	query: string[];
	features: IMapboxGeocodingAPIResponseFeature[];
	attribution: string;
}

export enum EMapboxPlaceType {
	country = 'country',
	region = 'region',
	postcode = 'postcode',
	district = 'district',
	place = 'place',
	locality = 'locality',
	neighborhood = 'neighborhood',
	address = 'address',
	poi = 'poi',
}

export enum EMapboxPropertiesAccuracy {
	rooftop = 'rooftop',
	parcel = 'parcel',
	point = 'point',
	interpolated = 'interpolated',
	intersection = 'intersection',
	street = 'street',
}

export interface IMapboxGeocodingAPIResponseFeature {
	id: string;
	type: 'Feature';
	place_type: EMapboxPlaceType[];
	relevance: number;
	address?: string;
	properties: {
		mapbox_id?: string;
		accuracy?: EMapboxPropertiesAccuracy;
		address?: string;
		category?: string;
		maki?: string;
		wikidata?: string;
		short_code?: string;
		foursquare?: string;
	};
	text: string;
	place_name: string;
	matching_text?: string;
	matching_place_name?: string;
	bbox: [number, number, number, number];
	center: [number, number];
	geometry: {
		type: 'Point';
		coordinates: [number, number];
		interpolated?: boolean;
		omitted?: boolean;
	};
	context: {
		id: string;
		mapbox_id?: string;
		short_code?: string;
		text?: string;
		wikidata?: string;
	}[];
}

// https://docs.mapbox.com/api/search/geocoding/#data-types
export const defaultMapboxSearchTypes = [EMapboxPlaceType.place, EMapboxPlaceType.address, EMapboxPlaceType.poi];

export const isSearchingYet = (search_term: string) => search_term.length >= 3;

export function getMapboxAPIKey(): string {
	return import.meta.env.VITE_MAPBOX_API_KEY;
}
