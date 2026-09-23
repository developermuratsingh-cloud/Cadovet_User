import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { Appointment, AppointmentStatus } from '@/domain/entities';
import { fromDateString } from '@/domain/usecases/dates';
import { AppText, Card, StatusBadge } from '../../components';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { useTheme } from '../../theme/useTheme';

export const statusTone = (s: AppointmentStatus) =>
  ({ CONFIRMED: 'success', PENDING: 'warning', COMPLETED: 'neutral', CANCELLED: 'danger' } as const)[s];

export function AppointmentCard({ appointment: a, onPress }: { appointment: Appointment; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors, radius } = useTheme();
  const language = useAppSelector(selectLanguage);
  const date = fromDateString(a.date);
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';

  return (
    <Card onPress={onPress} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
      <View style={{ width: 58, paddingVertical: 8, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.primaryLight }}>
        <AppText variant="caption" color="primaryDark" style={{ textTransform: 'uppercase' }}>{date.toLocaleDateString(locale, { month: 'short' })}</AppText>
        <AppText variant="title" color="primaryDark" style={{ lineHeight: 32 }}>{date.getDate()}</AppText>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <StatusBadge label={t(`appointments.status.${a.status}`)} tone={statusTone(a.status)} />
        <AppText variant="subheading" numberOfLines={1}>{a.serviceName ?? a.reason ?? t('appointments.detailTitle')}</AppText>
        <AppText variant="caption" color="textSecondary">🕒 {a.time}  ·  {date.toLocaleDateString(locale, { weekday: 'short' })}</AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {t('appointments.forPet', { name: a.petName })}
          {a.doctorName ? `  ·  ${t('appointments.with', { name: a.doctorName })}` : `  ·  ${t('appointments.doctorPending')}`}
        </AppText>
      </View>
    </Card>
  );
}
