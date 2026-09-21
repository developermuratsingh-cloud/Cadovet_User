import type { RootState } from '../store';

export const selectIsInitialized = (state: RootState) => state.app.isInitialized;
export const selectIsOnline = (state: RootState) => state.app.isOnline;
export const selectIsMenuOpen = (state: RootState) => state.app.isMenuOpen;
