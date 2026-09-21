import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ValidationError } from '@/domain/usecases/validation';

type Validators<T> = { [K in keyof T]?: (value: T[K], values: T) => ValidationError | null };

// Minimal form state: values + per-field validation. An error is shown once the field was blurred or a submit
// was attempted, so users aren't scolded while they are still typing their first character.
export function useForm<T extends Record<string, string>>(initial: T, validators: Validators<T>) {
  const { t } = useTranslation();
  const [values, setValues] = useState<T>(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const out: Partial<Record<keyof T, ValidationError | null>> = {};
    for (const key of Object.keys(validators) as (keyof T)[]) out[key] = validators[key]?.(values[key], values) ?? null;
    return out;
  }, [values, validators]);

  const isValid = useMemo(() => Object.values(errors).every((e) => !e), [errors]);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => setValues((v) => ({ ...v, [key]: value })), []);

  const fieldProps = <K extends keyof T>(key: K, transform?: (v: string) => string) => {
    const err = errors[key];
    return {
      value: values[key],
      onChangeText: (v: string) => setValue(key, (transform ? transform(v) : v) as T[K]),
      onBlur: () => setTouched((s) => ({ ...s, [key]: true })),
      error: err && (touched[key] || submitted) ? t(`validation.${err.code}`, err.params) : null,
    };
  };

  const handleSubmit = (onValid: (values: T) => void | Promise<void>) => () => {
    setSubmitted(true);
    if (!isValid) return;
    return onValid(values);
  };

  const reset = (next: T) => {
    setValues(next);
    setTouched({});
    setSubmitted(false);
  };

  return { values, setValue, fieldProps, handleSubmit, isValid, reset };
}
