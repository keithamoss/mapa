import { createSelector } from '@reduxjs/toolkit';
import { QueryStatus } from '@reduxjs/toolkit/query';
import { authApi } from '../../app/services/auth';
import type { RootState } from '../../app/store';

export const selectCheckLoginStateResult = authApi.endpoints.checkLoginStatus.select();

export const selectUser = createSelector(selectCheckLoginStateResult, (result) => result?.data?.user ?? null);

export const isUserLoggedIn = createSelector(
	selectCheckLoginStateResult,
	(result) => result?.data?.is_logged_in ?? undefined,
);

export const isMapLoadingViaRTK = (state: RootState) => {
	try {
		return state.api.queries['checkLoginStatus(undefined)']?.status === QueryStatus.pending;
	} catch {
		/* empty */
	}

	return true;
};
