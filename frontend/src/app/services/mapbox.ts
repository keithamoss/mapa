import { IMapboxGeocodingAPIResponse } from '../../features/searchLocations/searchLocationsHelpers';
import { api } from './api';

export const mapboxGeocodingApi = api.injectEndpoints({
	endpoints: (builder) => ({
		fetchMapboxGeocodingResults: builder.query<IMapboxGeocodingAPIResponse, { url: string }>({
			query: ({ url }) => ({
				url,
				credentials: 'omit',
			}),
		}),
	}),
});

export const { useFetchMapboxGeocodingResultsQuery } = mapboxGeocodingApi;
