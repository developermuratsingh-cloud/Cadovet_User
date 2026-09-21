export type LanguageCode = 'en' | 'hi';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
