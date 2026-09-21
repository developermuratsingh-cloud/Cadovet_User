import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetServicesQuery } from '@/data/api/serviceApi';
import type { Service } from '@/domain/entities';
import { AppText, AsyncBoundary, Card, EmojiTile, Screen } from '../../components';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectBooking } from '../../state/selectors/bookingSelectors';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { serviceSelected } from '../../state/slices/bookingSlice';
import { useTheme } from '../../theme/useTheme';
import { formatCurrency } from '../../utils/format';
import { serviceEmoji } from '../../utils/icons';
import { StepHeader } from './StepHeader';

export default function ServiceStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const language = useAppSelector(selectLanguage);
  const { selectedService } = useAppSelector(selectBooking);
  const query = useGetServicesQuery();

  const choose = (service: Service) => {
    dispatch(serviceSelected(service));
    router.push('/book/doctor');
  };

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch}>
      <StepHeader current={1} title={t('booking.chooseService')} />
      <AsyncBoundary {...query} isEmpty={(d) => d.length === 0} emptyMessage={t('errors.generic')}>
        {(services) =>
          services.map((s) => (
            <Card key={s.id} onPress={() => choose(s)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderColor: s.id === selectedService?.id ? colors.primary : colors.border, borderWidth: s.id === selectedService?.id ? 2 : 1 }}>
              <EmojiTile emoji={serviceEmoji(s.category, s.name)} />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="subheading">{s.name}</AppText>
                {s.description ? <AppText variant="caption" color="textMuted" numberOfLines={2}>{s.description}</AppText> : null}
                <AppText variant="label" color="primaryDark">
                  {formatCurrency(s.price, language)}
                  {s.durationMinutes ? `  ·  ${t('common.minutesShort', { count: s.durationMinutes })}` : ''}
                </AppText>
              </View>
            </Card>
          ))
        }
      </AsyncBoundary>
    </Screen>
  );
}
