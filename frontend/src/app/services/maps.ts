import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { api } from './api';
import { SymbologyProps } from './schemas';

export interface MapModifiableProps {
	name: string;
	default_symbology: SymbologyProps | null;
	available_schema_ids: number[];
}

export type NewMap = MapModifiableProps;

export interface Map extends MapModifiableProps {
	id: number;
	owner_id: number;
	last_used_schema_id: number | null;
}

export interface MapFavouritedSymbols {
	schema_id: number;
	symbol_ids: number[];
}

type MapsResponse = Map[];

export const mapsAdapter = createEntityAdapter<Map>();

const initialState = mapsAdapter.getInitialState();
export { initialState as initialMapsState };

export const mapsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getMaps: builder.query<EntityState<Map>, void>({
			query: () => 'maps/',
			transformResponse: (res: MapsResponse) => {
				return mapsAdapter.setAll(initialState, res);
			},
			// Provides a list of `Maps` by `id`.
			// If any mutation is executed that `invalidate`s any of these tags, this query will re-run to be always up-to-date.
			// The `LIST` id is a "virtual id" we just made up to be able to invalidate this query specifically if a new `Maps` element was added.
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			providesTags: (result, _error, _arg) => [
				// Always invalidate the map list, so when errors occur we still force a refresh on the LIST
				{ type: 'Map', id: 'LIST' },
				...(result !== undefined ? result.ids.map((id) => ({ type: 'Map' as const, id })) : []),
			],
		}),
		addMap: builder.mutation<Map, Partial<Map>>({
			query: (initialMap) => ({
				url: 'maps/',
				method: 'POST',
				body: initialMap,
			}),
			// Invalidates all Map-type queries providing the `LIST` id - after all, depending of the sort order,
			// that newly created map could show up in any lists.
			invalidatesTags: [{ type: 'Map', id: 'LIST' }],
		}),
		updateMap: builder.mutation<Map, Partial<Map>>({
			query: (map) => ({
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				url: `maps/${map.id}/`,
				method: 'PUT',
				body: map,
			}),
			// Invalidates all queries that subscribe to this Map `id` only.
			// In this case, `getMap` will be re-run. `getMaps` *might*  rerun, if this id was under its results.
			invalidatesTags: (result, error, { id }) => [{ type: 'Map', id }],
		}),
		patchMap: builder.mutation<Map, Partial<Map>>({
			query: (map) => ({
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				url: `maps/${map.id}/`,
				method: 'PATCH',
				body: map,
			}),
			// Invalidates all queries that subscribe to this Map `id` only.
			// In this case, `getMap` will be re-run. `getMaps` *might*  rerun, if this id was under its results.
			invalidatesTags: (result, error, { id }) => [{ type: 'Map', id }],
		}),
	}),
});

export const { useGetMapsQuery, useAddMapMutation, useUpdateMapMutation, usePatchMapMutation } = mapsApi;
