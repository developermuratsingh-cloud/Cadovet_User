import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText, StepProgress } from '../../components';

export function StepHeader({ current, title }: { current: number; title: string }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 10 }}>
      <StepProgress current={current} total={4} />
      <AppText variant="label" color="textMuted">{t('booking.stepOf', { current, total: 4 })}</AppText>
      <AppText variant="heading">{title}</AppText>
    </View>
  );
}
