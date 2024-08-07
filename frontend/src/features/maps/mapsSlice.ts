import { createSelector } from '@reduxjs/toolkit';
import { initialMapsState, mapsAdapter, mapsApi } from '../../app/services/maps';
import { RootState } from '../../app/store';

// Calling `someEndpoint.select(someArg)` generates a new selector that will return
// the query result object for a query with those parameters.
// To generate a selector for a specific query argument, call `select(theQueryArg)`.
// In this case, the users query has no params, so we don't pass anything to select()
export const selectMapsResult = mapsApi.endpoints.getMaps.select();

const selectMapsData = createSelector(selectMapsResult, (mapsResult) => mapsResult.data);

export const { selectAll: selectAllMaps, selectById: selectMapById } = mapsAdapter.getSelectors(
	(state: RootState) => selectMapsData(state) ?? initialMapsState,
);
