import { api } from './api';
import { featuresApi } from './features';

export enum MapRenderer {
	WebGLPointsLayer = 'WebGLPointsLayer',
	VectorImageLayer = 'VectorImageLayer',
}

export enum Basemap {
	MapboxVectorTile = 'MapboxVectorTile',
	MapboxWMTS = 'MapboxWMTS',
}

export enum BasemapStyle {
	Monochrome = 'clgu2ornp001j01r76h3o6j3g',
	Streets = 'cloksjj9n001q01rba0zj1ehu',
	Outdoors = 'cloksl0t5000b01pqg50gcbw2',
	Navigation = 'cloksjtvv001z01rher2q3r2d',
	Satellite = 'clokslfco002b01r728815x4k',
}

export enum QuickAddMode {
	Recent = 'Recent',
	Popular = 'Popular',
	Favourite = 'Favourite',
	Off = 'Off',
}

export interface UserProfileSettings {
	last_map_id?: number;
	map_renderer?: MapRenderer;
	basemap?: Basemap;
	basemap_style?: BasemapStyle;
	quick_add_mode?: QuickAddMode;
	quick_add_symbol_count?: number;
}

export interface User {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	name: string;
	initials: string;
	email: string;
	is_staff: boolean;
	date_joined: string;
	groups: string[];
	is_approved: boolean;
	settings: UserProfileSettings;
	last_gdrive_backup: string | null;
	whats_new_release_count: number;
}

type UserAuthStatusResponse = {
	is_logged_in: boolean;
	user: User | null;
};

export const authApi = api.injectEndpoints({
	endpoints: (builder) => ({
		checkLoginStatus: builder.query<UserAuthStatusResponse, void>({
			query: () => 'self',
			providesTags: ['User'],
		}),
		updateUserProfile: builder.mutation<UserProfileSettings, Partial<UserProfileSettings>>({
			query: (body) => ({
				url: 'profile/update_settings/',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['User'],
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				// We only need to re-fetch features if we're switching maps
				if ('last_map_id' in arg) {
					await queryFulfilled;
					dispatch(featuresApi.endpoints.getFeatures.initiate(undefined, { forceRefetch: true }));
				}
			},
		}),
		updateWhatsNewViewCount: builder.mutation<null, number>({
			query: (viewCount) => ({
				url: 'profile/update_what_new_view_count/',
				method: 'POST',
				body: { viewCount },
			}),
			invalidatesTags: ['User'],
		}),
	}),
});

export const { useCheckLoginStatusQuery, useUpdateUserProfileMutation, useUpdateWhatsNewViewCountMutation } = authApi;
