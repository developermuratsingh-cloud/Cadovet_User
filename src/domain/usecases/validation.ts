// Client-side validation rules. They are a superset of what cadovet-server (and the website) enforce, so the
// user gets instant feedback; the backend remains the authority. Rules return a code that the UI translates.

export type ValidationCode =
  | 'required'
  | 'nameTooShort'
  | 'nameInvalid'
  | 'emailInvalid'
  | 'mobileInvalid'
  | 'passwordTooShort'
  | 'passwordMismatch'
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

// Same patterns as cadovet-server authController.getIdentifierType.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE = /^\+?[0-9]{7,15}$/;
const MOBILE_LIKE = /^[+\d][\d\s\-()]*$/;
// \p{M} covers combining marks, which Indic scripts (e.g. Devanagari vowel signs) need.
const NAME = /^[\p{L}][\p{L}\p{M}\s.'-]*$/u;

export const PASSWORD_MIN = 6; // matches the website's signup rule
export const PASSWORD_MAX = 72; // bcrypt ignores anything longer
export const NAME_MIN = 2;
export const NAME_MAX = 60;

/** Trims, and strips spaces/dashes/brackets from mobile numbers so "98765 43210" is accepted. */
export const normalizeIdentifier = (raw: string): string => {
  const v = raw.trim();
  return MOBILE_LIKE.test(v) ? v.replace(/[\s\-()]/g, '') : v;
};

export const validateIdentifier = (raw: string): ValidationError | null => {
  const v = normalizeIdentifier(raw);
  if (!v) return fail('required');
  if (MOBILE_LIKE.test(raw.trim())) return MOBILE.test(v) ? null : fail('mobileInvalid');
  return EMAIL.test(v) ? null : fail('emailInvalid');
};

export const validateName = (raw: string): ValidationError | null => {
  const v = raw.trim();
  if (!v) return fail('required');
  if (v.length < NAME_MIN) return fail('nameTooShort', { min: NAME_MIN });
  if (v.length > NAME_MAX) return fail('tooLong', { max: NAME_MAX });
  return NAME.test(v) ? null : fail('nameInvalid');
};

export const validatePassword = (v: string): ValidationError | null => {
  if (!v) return fail('required');
  if (v.length < PASSWORD_MIN) return fail('passwordTooShort', { min: PASSWORD_MIN });
  if (v.length > PASSWORD_MAX) return fail('tooLong', { max: PASSWORD_MAX });
  return null;
};

export const validateConfirmPassword = (v: string, password: string): ValidationError | null => {
  if (!v) return fail('required');
  return v === password ? null : fail('passwordMismatch');
};

/** 0 = too short/weak … 3 = strong. Only used for the signup hint; it never blocks submission. */
export const passwordStrength = (v: string): 0 | 1 | 2 | 3 => {
  if (v.length < PASSWORD_MIN) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(v)).length;
  if (v.length >= 10 && variety >= 3) return 3;
  if (v.length >= 8 && variety >= 2) return 2;
  return 1;
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

/** The 6-digit verification code sent for a password reset. */
export const validateOtp = (raw: string): ValidationError | null => {
  const v = raw.trim();
  if (!v) return fail('required');
  return /^\d{6}$/.test(v) ? null : fail('otpInvalid');
};
