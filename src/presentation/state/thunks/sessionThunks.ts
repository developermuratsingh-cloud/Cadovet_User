import { createAsyncThunk } from '@reduxjs/toolkit';

import { authApi } from '@/data/api/authApi';
import { secureStorage } from '@/data/storage/secureStorage';
import { appInitialized } from '../slices/appSlice';
import { loggedOut, sessionRestored } from '../slices/authSlice';
import type { AppDispatch, RootState } from '../store';

// Restores the session from secure storage. The stored access token may be stale; the first API call
// that returns 401 transparently refreshes it (see baseApi).
export const initializeApp = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'app/initialize',
  async (_, { dispatch }) => {
    try {
      dispatch(sessionRestored(await secureStorage.loadTokens()));
    } catch {
      dispatch(sessionRestored(null));
    } finally {
      dispatch(appInitialized());
    }
  },
);

export const signOut = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
  'auth/signOut',
  async (_, { dispatch, getState }) => {
    const refreshToken = getState().auth.refreshToken;
    try {
      if (refreshToken) await dispatch(authApi.endpoints.revokeSession.initiate({ refreshToken })).unwrap();
    } catch {
      // Offline or already expired: local sign-out must still succeed.
    } finally {
      dispatch(loggedOut());
    }
  },
);
