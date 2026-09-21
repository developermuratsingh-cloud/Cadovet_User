import type { RootState } from '../store';

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
