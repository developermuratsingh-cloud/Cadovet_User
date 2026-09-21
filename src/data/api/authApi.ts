import type { AuthTokens } from '@/domain/entities';
import { credentialsSet } from '@/presentation/state/slices/authSlice';
import type { ApiEnvelope, LoginDto } from '../dto';
import { baseApi, unwrap } from './baseApi';

export interface LoginRequest {
  identifier: string; // email or mobile number
  password: string;
}

export interface SignupRequest extends LoginRequest {
  name: string;
  referralCode?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthTokens, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: unwrap<LoginDto, AuthTokens>((d) => ({ accessToken: d.token, refreshToken: d.refreshToken })),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(credentialsSet(data));
        } catch {
          // Failure surfaces through the mutation state on the calling screen.
        }
      },
    }),

    // The backend's signup does not return a token, so sign in right after registering.
    signup: build.mutation<void, SignupRequest>({
      query: ({ name, identifier, password, referralCode }) => ({
        url: '/auth/signup',
        method: 'POST',
        body: { name, identifier, password, ...(referralCode ? { referral_code: referralCode } : {}) },
      }),
      transformResponse: (_: ApiEnvelope<unknown>) => undefined,
      async onQueryStarted({ identifier, password }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          await dispatch(authApi.endpoints.login.initiate({ identifier, password }));
        } catch {
          // Failure surfaces through the mutation state on the calling screen.
        }
      },
    }),

    // Step 1 of a password reset: the server always answers the same way, whether or not the account exists.
    forgotPassword: build.mutation<void, { identifier: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
      transformResponse: (_: ApiEnvelope<unknown>) => undefined,
    }),

    // Step 2: the emailed/SMS code plus the new password. Signs the account out everywhere.
    resetPassword: build.mutation<void, { identifier: string; code: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
      transformResponse: (_: ApiEnvelope<unknown>) => undefined,
    }),

    // Best-effort revocation of the refresh token; the caller clears local state regardless.
    revokeSession: build.mutation<void, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
      transformResponse: (_: ApiEnvelope<unknown>) => undefined,
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useForgotPasswordMutation, useResetPasswordMutation } = authApi;
