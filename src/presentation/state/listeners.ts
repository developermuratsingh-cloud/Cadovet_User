import { createListenerMiddleware } from '@reduxjs/toolkit';

import { baseApi } from '@/data/api/baseApi';
import { secureStorage } from '@/data/storage/secureStorage';
import { credentialsSet, loggedOut, tokensRefreshed } from './slices/authSlice';
import { bookingReset } from './slices/bookingSlice';
import type { RootState } from './store';

export const listenerMiddleware = createListenerMiddleware();
const startListening = listenerMiddleware.startListening.withTypes<RootState>();

// Keep secure storage in step with the auth slice.
startListening({
  matcher: (action) => credentialsSet.match(action) || tokensRefreshed.match(action),
  effect: async (_action, { getState }) => {
    const { accessToken, refreshToken } = getState().auth;
    if (accessToken && refreshToken) await secureStorage.saveTokens({ accessToken, refreshToken });
  },
});

// Signing out (manually or after a rejected refresh) wipes credentials and everything cached for the user.
startListening({
  actionCreator: loggedOut,
  effect: async (_action, { dispatch }) => {
    await secureStorage.clearTokens();
    dispatch(baseApi.util.resetApiState());
    dispatch(bookingReset());
  },
});
