import type { RootState } from '../store';

export const selectLanguage = (state: RootState) => state.language.currentLanguage;
export const selectAvailableLanguages = (state: RootState) => state.language.availableLanguages;
