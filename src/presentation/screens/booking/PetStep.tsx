import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetPetsQuery } from '@/data/api/petApi';
import { AppText, AsyncBoundary, Card, EmojiTile, EmptyState, Screen } from '../../components';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectBooking } from '../../state/selectors/bookingSelectors';
import { petSelected } from '../../state/slices/bookingSlice';
import { useTheme } from '../../theme/useTheme';
import { petEmoji } from '../../utils/icons';
import { StepHeader } from './StepHeader';

export default function PetStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { petId } = useAppSelector(selectBooking);
  const query = useGetPetsQuery();

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <StepHeader current={2} title={t('booking.choosePet')} />
      <AsyncBoundary {...query}>
        {(pets) =>
          pets.length === 0 ? (
            <EmptyState emoji="🐶" message={t('booking.noPets')} actionLabel={t('booking.addPet')} onAction={() => router.push('/pet/form')} />
          ) : (
            pets.map((p) => (
              <Card
                key={p.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderColor: p.id === petId ? colors.primary : colors.border, borderWidth: p.id === petId ? 2 : 1 }}
                onPress={() => {
                  dispatch(petSelected(p.id));
                  router.push('/book/schedule');
                }}>
                <EmojiTile emoji={petEmoji(p.species)} />
                <View style={{ flex: 1 }}>
                  <AppText variant="subheading">{p.name}</AppText>
                  <AppText variant="caption" color="textMuted">{[p.species, p.breed].filter(Boolean).join(' · ')}</AppText>
                </View>
              </Card>
            ))
          )
        }
      </AsyncBoundary>
    </Screen>
  );
}
