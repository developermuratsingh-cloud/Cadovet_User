import type { UserProfile } from '@/domain/entities';
import { loggedOut } from '@/presentation/state/slices/authSlice';
import type { ApiEnvelope, MeDto } from '../dto';
import { toUserProfile } from '../mappers';
import { baseApi, unwrap } from './baseApi';

export interface CurrentUser {
  profile: UserProfile;
  permissions: string[];
}

export interface UpdateProfileRequest {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const toCurrentUser = (d: MeDto): CurrentUser => ({ profile: toUserProfile(d), permissions: d.permissions });

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<CurrentUser, void>({
      query: () => '/auth/me',
      transformResponse: unwrap(toCurrentUser),
      providesTags: ['Me'],
    }),
    updateMe: build.mutation<CurrentUser, UpdateProfileRequest>({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
      transformResponse: unwrap(toCurrentUser),
      invalidatesTags: ['Me'],
    }),
    // Anonymises the account server-side (password required). On success the session is cleared locally,
    // which also wipes the API cache and returns the router to Login.
    deleteAccount: build.mutation<void, { password: string }>({
      query: (body) => ({ url: '/auth/me', method: 'DELETE', body }),
      transformResponse: (_: ApiEnvelope<unknown>) => undefined,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(loggedOut());
        } catch {
          // Failure (e.g. wrong password) surfaces through the mutation state on the calling screen.
        }
      },
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation, useDeleteAccountMutation } = userApi;
