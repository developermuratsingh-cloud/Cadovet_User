import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetDoctorsQuery } from '@/data/api/doctorApi';
import type { Doctor } from '@/domain/entities';
import { AppText, AsyncBoundary, Avatar, Card, Screen } from '../../components';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectBooking } from '../../state/selectors/bookingSelectors';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { doctorSelected } from '../../state/slices/bookingSlice';
import { useTheme } from '../../theme/useTheme';
import { formatCurrency } from '../../utils/format';
import { StepHeader } from './StepHeader';

export default function DoctorStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const language = useAppSelector(selectLanguage);
  const { selectedDoctor } = useAppSelector(selectBooking);
  const query = useGetDoctorsQuery();

  const choose = (doctor: Doctor) => {
    dispatch(doctorSelected(doctor));
    router.push('/book/pet');
  };

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch}>
      <StepHeader current={2} title={t('booking.chooseDoctor')} />
      <AsyncBoundary {...query} isEmpty={(d) => d.length === 0} emptyMessage={t('errors.generic')}>
        {(doctors) =>
          doctors.map((d) => (
            <Card key={d.id} onPress={() => choose(d)} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', borderColor: d.id === selectedDoctor?.id ? colors.primary : colors.border, borderWidth: d.id === selectedDoctor?.id ? 2 : 1 }}>
              <Avatar name={d.name.replace(/^Dr\.?\s*/i, '')} size={52} />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="subheading">{d.name}</AppText>
                <AppText variant="caption" color="textMuted" numberOfLines={2}>{d.specialization}</AppText>
                <AppText variant="caption" color="textSecondary">{t('booking.experience', { count: d.experienceYears })}  ·  <AppText variant="caption" color="warning">★ {d.rating.toFixed(1)}</AppText></AppText>
                <AppText variant="label" color="primaryDark">{t('booking.fee')}: {formatCurrency(d.consultationFee, language)}</AppText>
              </View>
            </Card>
          ))
        }
      </AsyncBoundary>
    </Screen>
  );
}
