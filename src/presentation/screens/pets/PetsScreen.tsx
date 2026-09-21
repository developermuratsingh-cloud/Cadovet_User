import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetPetsQuery } from '@/data/api/petApi';
import { petAge } from '@/domain/usecases/pets';
import { AppText, AsyncBoundary, Button, Card, EmojiTile, MenuButton, Screen } from '../../components';
import { petEmoji } from '../../utils/icons';

export default function PetsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const query = useGetPetsQuery();

  return (
    <Screen refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch} contentStyle={{ paddingBottom: 96 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MenuButton />
        <AppText variant="title" style={{ flex: 1 }}>{t('pets.title')}</AppText>
      </View>
      <Button title={t('pets.add')} icon="add-circle" onPress={() => router.push('/pet/form')} />
      <AsyncBoundary {...query} isEmpty={(d) => d.length === 0} emptyMessage={t('pets.empty')}>
        {(pets) =>
          pets.map((p) => {
            const age = petAge(p.dateOfBirth);
            const ageText = age ? (age.years > 0 ? t('common.yearsShort', { count: age.years }) : t('common.monthsShort', { count: age.months })) : null;
            return (
              <Card key={p.id} onPress={() => router.push({ pathname: '/pet/[id]', params: { id: p.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <EmojiTile emoji={petEmoji(p.species)} size={56} />
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="subheading">{p.name}</AppText>
                  <AppText variant="caption" color="textMuted">{[p.species, p.breed, ageText].filter(Boolean).join(' · ')}</AppText>
                </View>
              </Card>
            );
          })
        }
      </AsyncBoundary>
    </Screen>
  );
}
