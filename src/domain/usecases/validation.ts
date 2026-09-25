// Client-side validation rules. They are a superset of what cadovet-server (and the website) enforce, so the
// user gets instant feedback; the backend remains the authority. Rules return a code that the UI translates.

import { isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/mobile';

export type ValidationCode =
  | 'required'
  | 'nameTooShort'
  | 'nameInvalid'
  | 'emailInvalid'
  | 'mobileInvalid'
  | 'phone10'
  | 'ageInvalid'
  | 'dateFormat'
  | 'dateInvalid'
  | 'dateFuture'
  | 'dateTooOld'
  | 'weightInvalid'
  | 'pincodeInvalid'
  | 'tooLong'
  | 'tooShort'
  | 'fileRequired'
  | 'fileTooLarge'
  | 'fileType'
  | 'codeInvalid'
  | 'otpInvalid';

export interface ValidationError {
  code: ValidationCode;
  params?: Record<string, number>;
}

const fail = (code: ValidationCode, params?: Record<string, number>): ValidationError => ({ code, params });

// Same email pattern as cadovet-server authController.getIdentifierType.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// \p{M} covers combining marks, which Indic scripts (e.g. Devanagari vowel signs) need.
const NAME = /^[\p{L}][\p{L}\p{M}\s.'-]*$/u;

export const NAME_MIN = 2;
export const NAME_MAX = 60;
const PHONE_DIGITS_MAX = 15; // E.164 upper bound, same as the server's mobile pattern

/**
 * The country whose numbers the server stores without a prefix: accounts and the website use the plain national
 * number for it ("9876543210"), so the app must send that exact form. It is also the country pre-selected on the auth
 * screens, because the clinic operates in India.
 */
export const HOME_COUNTRY: CountryCode = 'IN';

/**
 * Cleans what was typed or pasted into the mobile field. Digits only; a pasted international number
 * ("+91 98765 43210") is split into its country and national digits so the country button follows along.
 */
export const sanitizePhoneInput = (raw: string, country: CountryCode): { country: CountryCode; digits: string } => {
  const text = raw.trim();
  if (text.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(text);
    if (parsed?.country) return { country: parsed.country, digits: parsed.nationalNumber.slice(0, PHONE_DIGITS_MAX) };
  }
  return { country, digits: text.replace(/\D/g, '').slice(0, PHONE_DIGITS_MAX) };
};

/** A mobile number that is valid in the selected country's numbering plan (a pasted "+…" number carries its own). */
export const validateMobile = (raw: string, country: CountryCode = HOME_COUNTRY): ValidationError | null => {
  const v = raw.trim();
  if (!v) return fail('required');
  return isValidPhoneNumber(v, country) ? null : fail('mobileInvalid');
};

/**
 * The string the API expects. A home-country number is sent as the plain national number (how it is already stored);
 * any other country goes as E.164 ("+14155552671") so numbers from different countries can't collide.
 */
export const toServerMobile = (raw: string, country: CountryCode = HOME_COUNTRY): string => {
  const v = raw.trim();
  const parsed = parsePhoneNumberFromString(v, country);
  if (!parsed) return v.replace(/\D/g, '');
  return parsed.country === HOME_COUNTRY ? parsed.nationalNumber : parsed.number;
};

/** The website's doorstep form takes a plain 10-digit mobile number. */
export const validateTenDigitPhone = (raw: string): ValidationError | null =>
  !raw ? fail('required') : /^\d{10}$/.test(raw) ? null : fail('phone10');

/** Pet age in years, 0-100, as the server accepts it. */
export const validateAge = (raw: string): ValidationError | null => {
  if (!raw.trim()) return fail('required');
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? null : fail('ageInvalid');
};

/** Optional. Empty is fine; otherwise it must look like an email address. */
export const validateOptionalEmail = (raw: string): ValidationError | null => {
  const v = raw.trim();
  return !v || EMAIL.test(v) ? null : fail('emailInvalid');
};

export const validateName = (raw: string): ValidationError | null => {
  const v = raw.trim();
  if (!v) return fail('required');
  if (v.length < NAME_MIN) return fail('nameTooShort', { min: NAME_MIN });
  if (v.length > NAME_MAX) return fail('tooLong', { max: NAME_MAX });
  return NAME.test(v) ? null : fail('nameInvalid');
};

export const validateRequiredText = (max: number) => (v: string): ValidationError | null => {
  const t = v.trim();
  if (!t) return fail('required');
  return t.length > max ? fail('tooLong', { max }) : null;
};

export const validateOptionalText = (max: number) => (v: string): ValidationError | null =>
  v.trim().length > max ? fail('tooLong', { max }) : null;

export const isCompleteDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Optional. Must be a real calendar date, not in the future and not absurdly old. */
export const validateDateOfBirth = (raw: string, now: Date = new Date()): ValidationError | null => {
  const v = raw.trim();
  if (!v) return null;
  if (!isCompleteDate(v)) return fail('dateFormat');
  const [y, m, d] = v.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return fail('dateInvalid');
  if (date > now) return fail('dateFuture');
  if (now.getFullYear() - y > 40) return fail('dateTooOld');
  return null;
};

/** Optional weight in kg: a positive number up to 200. */
export const validateWeight = (raw: string): ValidationError | null => {
  const v = raw.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n <= 200 && /^\d+(\.\d{1,2})?$/.test(v) ? null : fail('weightInvalid');
};

/** Optional 6-digit Indian PIN code. */
export const validatePincode = (raw: string): ValidationError | null => {
  const v = raw.trim();
  return !v || /^\d{6}$/.test(v) ? null : fail('pincodeInvalid');
};

/** Live mask for date inputs: "20210615" -> "2021-06-15". */
export const formatDateInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
};

/** Required free text with a minimum and maximum length (e.g. a support message). */
export const validateMessage = (min: number, max: number) => (v: string): ValidationError | null => {
  const t = v.trim();
  if (!t) return fail('required');
  if (t.length < min) return fail('tooShort', { min });
  return t.length > max ? fail('tooLong', { max }) : null;
};

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // matches the backend upload limit
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

/** A document must be chosen, be a PDF/image, and be at most 10 MB. */
export const validateFile = (file: { mimeType: string; size: number | null } | null): ValidationError | null => {
  if (!file) return fail('fileRequired');
  if (!ALLOWED_FILE_TYPES.includes(file.mimeType.toLowerCase())) return fail('fileType');
  if (file.size !== null && file.size > MAX_FILE_BYTES) return fail('fileTooLarge');
  return null;
};

const CODE = /^[A-Za-z0-9]{4,30}$/;

/** Referral / coupon codes are letters and digits only. `optional` allows an empty value. */
export const validateCode = (optional: boolean) => (raw: string): ValidationError | null => {
  const v = raw.trim();
  if (!v) return optional ? null : fail('required');
  return CODE.test(v) ? null : fail('codeInvalid');
};

export const formatFileSize = (bytes: number | null): string => {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** The 6-digit one-time code sent by SMS. */
export const validateOtp = (raw: string): ValidationError | null => {
  const v = raw.trim();
  if (!v) return fail('required');
  return /^\d{6}$/.test(v) ? null : fail('otpInvalid');
};
