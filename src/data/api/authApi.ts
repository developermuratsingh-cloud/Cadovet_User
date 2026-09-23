import type { AuthTokens } from '@/domain/entities';
import { credentialsSet } from '@/presentation/state/slices/authSlice';
import type { ApiEnvelope, LoginDto } from '../dto';
import { baseApi, unwrap } from './baseApi';

// There are no passwords: a customer proves their mobile number with a 6-digit code sent by SMS.
export type OtpPurpose = 'login' | 'signup';

export interface SendOtpRequest {
  mobile: string; // as the server stores it, see toServerMobile
  purpose: OtpPurpose;
  email?: string; // sign-up only: lets the server reject an email that is already taken before the code is sent
}

export interface LoginOtpRequest {
  mobile: string;
  code: string;
}

export interface SignupOtpRequest extends LoginOtpRequest {
  name: string;
  email?: string;
  referralCode?: string;
}

// Both verify endpoints answer with a session, which is stored the moment it arrives.
async function storeSession(dispatch: (a: ReturnType<typeof credentialsSet>) => unknown, queryFulfilled: Promise<{ data: AuthTokens }>) {
  try {
    const { data } = await queryFulfilled;
    dispatch(credentialsSet(data));
  } catch {
    // Failure surfaces through the mutation state on the calling screen.
  }
}

const toTokens = unwrap<LoginDto, AuthTokens>((d) => ({ accessToken: d.token, refreshToken: d.refreshToken }));

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendOtp: build.mutation<void, SendOtpRequest>({
      query: (body) => ({ url: '/auth/otp/send', method: 'POST', body }),
      transformResponse: (_: ApiEnvelope<unknown>) => undefined,
    }),

    loginWithOtp: build.mutation<AuthTokens, LoginOtpRequest>({
      query: (body) => ({ url: '/auth/otp/login', method: 'POST', body }),
      transformResponse: toTokens,
      onQueryStarted: (_, { dispatch, queryFulfilled }) => storeSession(dispatch, queryFulfilled),
    }),

    signupWithOtp: build.mutation<AuthTokens, SignupOtpRequest>({
      query: ({ name, mobile, email, referralCode, code }) => ({
        url: '/auth/otp/signup',
        method: 'POST',
        body: { name, mobile, code, ...(email ? { email } : {}), ...(referralCode ? { referral_code: referralCode } : {}) },
      }),
      transformResponse: toTokens,
      onQueryStarted: (_, { dispatch, queryFulfilled }) => storeSession(dispatch, queryFulfilled),
    }),

    // Best-effort revocation of the refresh token; the caller clears local state regardless.
    revokeSession: build.mutation<void, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
      transformResponse: (_: ApiEnvelope<unknown>) => undefined,
    }),
  }),
});

export const { useSendOtpMutation, useLoginWithOtpMutation, useSignupWithOtpMutation } = authApi;
