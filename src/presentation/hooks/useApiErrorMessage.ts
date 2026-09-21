import { useTranslation } from 'react-i18next';

import { isApiError } from '@/core/errors';

// Server messages are shown as-is; transport failures are mapped to translated copy.
export function useApiErrorMessage() {
  const { t } = useTranslation();
  return (error: unknown): string => {
    if (!isApiError(error)) return t('errors.generic');
    if (error.status === 'NETWORK') return __DEV__ && error.message ? `${t('errors.network')}\n\n[dev] ${error.message}` : t('errors.network');
    if (error.status === 'TIMEOUT') return t('errors.timeout');
    return error.message || t('errors.generic');
  };
}
