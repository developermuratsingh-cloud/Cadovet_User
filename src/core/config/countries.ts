import countryNames from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import hi from 'i18n-iso-countries/langs/hi.json';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js/mobile';

import type { LanguageCode } from './languages';

countryNames.registerLocale(en);
countryNames.registerLocale(hi);

export type { CountryCode };

export interface Country {
  code: CountryCode;
  name: string;
  /** International dialling prefix with the plus sign, e.g. "+91". */
  dial: string;
  flag: string;
}

// Regional-indicator letters spell a flag emoji, so no flag assets or lookup table are needed.
export const flagEmoji = (code: string): string =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));

export const dialCode = (code: CountryCode): string => `+${getCountryCallingCode(code)}`;

const cache = new Map<LanguageCode, Country[]>();

/** Every country libphonenumber can validate numbers for, named in the given language and sorted by name. */
export function getCountryList(language: LanguageCode): Country[] {
  const cached = cache.get(language);
  if (cached) return cached;
  const list = getCountries()
    // "alias" picks the everyday short name where one exists ("Iran", not "Islamic Republic of Iran").
    .map((code) => ({ code, name: countryNames.getName(code, language, { select: 'alias' }) ?? countryNames.getName(code, 'en', { select: 'alias' }) ?? '' }))
    // Territories such as Ascension Island have a calling code but no ISO country name.
    .filter((c) => c.name)
    .map((c): Country => ({ ...c, dial: dialCode(c.code), flag: flagEmoji(c.code) }))
    .sort((a, b) => a.name.localeCompare(b.name, language));
  cache.set(language, list);
  return list;
}

/** Name, dial code ("91" or "+91") or ISO code contains the query. */
export function filterCountries(list: Country[], query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  const digits = q.replace(/\D/g, '');
  return list.filter(
    (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || (digits && c.dial.slice(1).startsWith(digits)),
  );
}
