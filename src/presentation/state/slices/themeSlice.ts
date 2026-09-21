import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'system' } as ThemeState,
  reducers: {
    themeModeChanged: (state, { payload }: PayloadAction<ThemeMode>) => {
      state.mode = payload;
    },
  },
});

export const { themeModeChanged } = themeSlice.actions;
export default themeSlice.reducer;
