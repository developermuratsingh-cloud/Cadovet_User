import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthTokens } from '@/domain/entities';

// Session state only. The tokens are persisted by secure storage (see listeners.ts), never by redux-persist.
// Loading/error for login and signup come from the RTK Query mutation state, so they are not duplicated here.
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = { isAuthenticated: false, accessToken: null, refreshToken: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsSet: (state, { payload }: PayloadAction<AuthTokens>) => {
      state.isAuthenticated = true;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    tokensRefreshed: (state, { payload }: PayloadAction<AuthTokens>) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    // Restoring from secure storage on launch; unlike credentialsSet this is not written back.
    sessionRestored: (state, { payload }: PayloadAction<AuthTokens | null>) => {
      state.isAuthenticated = !!payload;
      state.accessToken = payload?.accessToken ?? null;
      state.refreshToken = payload?.refreshToken ?? null;
    },
    loggedOut: () => initialState,
  },
});

export const { credentialsSet, tokensRefreshed, sessionRestored, loggedOut } = authSlice.actions;
export default authSlice.reducer;
