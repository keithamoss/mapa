import { api } from './api';

export enum MapRenderer {
	WebGLPointsLayer = 'WebGLPointsLayer',
	VectorImageLayer = 'VectorImageLayer',
}

export enum Basemap {
	MapboxVectorTile = 'MapboxVectorTile',
	MapboxWMTS = 'MapboxWMTS',
}

export interface UserProfileSettings {
	last_map_id?: number;
	map_renderer?: MapRenderer;
	basemap?: Basemap;
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
		}),
	}),
});

export const { useCheckLoginStatusQuery, useUpdateUserProfileMutation } = authApi;
