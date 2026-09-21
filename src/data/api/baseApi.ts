import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '@/core/config/env';
import type { ApiError } from '@/core/errors';
import { loggedOut, tokensRefreshed } from '@/presentation/state/slices/authSlice';
import type { RootState } from '@/presentation/state/store';
import type { ApiEnvelope, RefreshDto } from '../dto';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: 15_000,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// A 401 from these means "wrong credentials / bad token", not "session expired".
const isCredentialEndpoint = (args: string | FetchArgs) => {
  const url = typeof args === 'string' ? args : args.url;
  return /^\/auth\/(login|signup|refresh)/.test(url);
};

type RefreshOutcome = 'refreshed' | 'rejected' | 'unreachable';
let refreshInFlight: Promise<RefreshOutcome> | null = null;

// The backend rotates refresh tokens, so concurrent 401s must share a single refresh call.
const refreshSession = (
  api: Parameters<typeof rawBaseQuery>[1],
  extra: Parameters<typeof rawBaseQuery>[2],
): Promise<RefreshOutcome> => {
  refreshInFlight ??= (async (): Promise<RefreshOutcome> => {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (!refreshToken) return 'rejected';

    const res = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
      api,
      extra,
    );
    if (res.data) {
      const { token, refreshToken: next } = (res.data as ApiEnvelope<RefreshDto>).data;
      api.dispatch(tokensRefreshed({ accessToken: token, refreshToken: next }));
      return 'refreshed';
    }
    // Only an explicit rejection ends the session; being offline must not log the user out.
    return typeof res.error?.status === 'number' ? 'rejected' : 'unreachable';
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

const toApiError = (error: FetchBaseQueryError): ApiError => {
  switch (error.status) {
    case 'FETCH_ERROR':
      // The transport error text is otherwise lost; keep it for development diagnostics (never shown in release builds).
      return { status: 'NETWORK', message: __DEV__ ? String(error.error) : '' };
    case 'TIMEOUT_ERROR':
      return { status: 'TIMEOUT', message: '' };
    case 'PARSING_ERROR':
      return { status: 'PARSING', message: '' };
    case 'CUSTOM_ERROR':
      return { status: 'UNKNOWN', message: error.error };
    default: {
      // Server errors are { success:false, message, errors?: string[] } (some legacy handlers use `error`).
      const body = error.data as { message?: string; errors?: string[]; error?: string } | undefined;
      return { status: error.status, message: body?.message ?? body?.errors?.[0] ?? body?.error ?? '' };
    }
  }
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra);

  if (result.error?.status === 401 && !isCredentialEndpoint(args)) {
    const outcome = await refreshSession(api, extra);
    if (outcome === 'refreshed') {
      result = await rawBaseQuery(args, api, extra);
    } else if (outcome === 'rejected') {
      api.dispatch(loggedOut());
    }
  }

  return result.error ? { error: toApiError(result.error) } : { data: result.data, meta: result.meta };
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me', 'Pet', 'Appointment', 'Slots', 'MedicalRecord', 'Invoice', 'Document', 'Referral'],
  endpoints: () => ({}),
});

// Unwraps the backend's { success, data } envelope.
export const unwrap = <T, R>(map: (data: T) => R) => (response: ApiEnvelope<T>): R => map(response.data);
