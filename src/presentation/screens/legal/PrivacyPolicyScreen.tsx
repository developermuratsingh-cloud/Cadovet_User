import { useTranslation } from 'react-i18next';

import { AppText, Card, Screen } from '../../components';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { formatDate } from '../../utils/format';

// Bump when the policy text changes.
const LAST_UPDATED = '2026-09-20';
const SECTIONS = ['1', '2', '3', '4', '5', '6', '7'] as const;

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  const language = useAppSelector(selectLanguage);

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <AppText variant="caption" color="textMuted">{t('privacy.updated', { date: formatDate(LAST_UPDATED, language) })}</AppText>
      <AppText color="textSecondary">{t('privacy.intro')}</AppText>
      {SECTIONS.map((n) => (
        <Card key={n}>
          <AppText variant="subheading">{t(`privacy.s${n}Title`)}</AppText>
          <AppText color="textSecondary">{t(`privacy.s${n}Body`)}</AppText>
        </Card>
      ))}
    </Screen>
  );
}
