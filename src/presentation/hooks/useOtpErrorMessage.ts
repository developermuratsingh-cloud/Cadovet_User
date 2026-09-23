import { useTranslation } from 'react-i18next';

import { isApiError } from '@/core/errors';
import { useApiErrorMessage } from './useApiErrorMessage';

/**
 * Turns a failed "send code" / "verify code" request into translated copy. The status code decides the message, so the
 * server's English text is only used for cases the app has no wording for.
 */
export function useOtpErrorMessage() {
  const { t } = useTranslation();
  const fallback = useApiErrorMessage();
  return (error: unknown, step: 'send' | 'verify'): string | null => {
    if (!error) return null;
    if (isApiError(error)) {
      if (error.status === 429) return step === 'send' ? t('otp.tooManyRequests') : t('otp.tooMany');
      if (step === 'send' && error.status === 404) return t('auth.noAccountForNumber');
      if (error.status === 409) return t('auth.alreadyExists');
      if (step === 'verify' && error.status === 400) return /referral/i.test(error.message) ? t('auth.referralNotFound') : t('otp.invalid');
    }
    return fallback(error);
  };
}
