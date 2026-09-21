import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { loggedOut } from './authSlice';

export interface AppState {
  isInitialized: boolean;
  isOnline: boolean;
  isMenuOpen: boolean; // side menu, opened from several screens
}

const appSlice = createSlice({
  name: 'app',
  initialState: { isInitialized: false, isOnline: true, isMenuOpen: false } as AppState,
  reducers: {
    appInitialized: (state) => {
      state.isInitialized = true;
    },
    onlineStatusChanged: (state, { payload }: PayloadAction<boolean>) => {
      state.isOnline = payload;
    },
    menuOpened: (state) => {
      state.isMenuOpen = true;
    },
    menuClosed: (state) => {
      state.isMenuOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loggedOut, (state) => {
      state.isMenuOpen = false;
    });
  },
});

export const { appInitialized, onlineStatusChanged, menuOpened, menuClosed } = appSlice.actions;
export default appSlice.reducer;
