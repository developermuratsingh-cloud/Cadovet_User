import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getLocales } from 'expo-localization';

import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, type LanguageCode, type LanguageOption } from '@/core/config/languages';

export interface LanguageState {
  currentLanguage: LanguageCode;
  availableLanguages: LanguageOption[];
}

// First launch: follow the device language when supported. After that the persisted choice wins.
const deviceLanguage = getLocales()[0]?.languageCode;
const initialLanguage =
  AVAILABLE_LANGUAGES.find((l) => l.code === deviceLanguage)?.code ?? DEFAULT_LANGUAGE;

const languageSlice = createSlice({
  name: 'language',
  initialState: { currentLanguage: initialLanguage, availableLanguages: AVAILABLE_LANGUAGES } as LanguageState,
  reducers: {
    languageChanged: (state, { payload }: PayloadAction<LanguageCode>) => {
      state.currentLanguage = payload;
    },
  },
});

export const { languageChanged } = languageSlice.actions;
export default languageSlice.reducer;
