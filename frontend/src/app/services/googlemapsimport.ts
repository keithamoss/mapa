import { api } from './api';

type GoogleMapsImportResponse = {
	place_name: string;
	lat: number;
	lon: number;
};

export const googlemapsimportApi = api.injectEndpoints({
	endpoints: (builder) => ({
		googleMapsImport: builder.query<GoogleMapsImportResponse, string>({
			query: (sharelinkURL) => ({
				url: 'googlemapsimport',
				params: { sharelinkURL },
			}),
		}),
	}),
});

export const { useGoogleMapsImportQuery } = googlemapsimportApi;
