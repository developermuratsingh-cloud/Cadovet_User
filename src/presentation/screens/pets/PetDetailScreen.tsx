import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { useDeletePetMutation, useGetPetQuery } from '@/data/api/petApi';
import { petAge } from '@/domain/usecases/pets';
import { AppText, AsyncBoundary, Button, Card, EmojiTile, HeroCard, Screen } from '../../components';
import { petEmoji } from '../../utils/icons';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { formatDate } from '../../utils/format';

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <View style={{ gap: 2 }}>
      <AppText variant="label" color="textSecondary">{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

export default function PetDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const errorMessage = useApiErrorMessage();
  const language = useAppSelector(selectLanguage);
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useGetPetQuery(Number(id));
  const [remove, { isLoading }] = useDeletePetMutation();

  const confirmDelete = () =>
    Alert.alert(t('pets.deleteTitle'), t('pets.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(Number(id)).unwrap();
            router.back();
          } catch (e) {
            Alert.alert(errorMessage(e));
          }
        },
      },
    ]);

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <AsyncBoundary {...query}>
        {(p) => {
          const age = petAge(p.dateOfBirth);
          const yes = t('common.yes');
          const no = t('common.no');
          return (
            <>
              <HeroCard>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <EmojiTile emoji={petEmoji(p.species)} size={64} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="title" style={{ color: '#FFFFFF' }}>{p.name}</AppText>
                    <AppText style={{ color: 'rgba(255,255,255,0.9)' }}>{[p.species, p.breed].filter(Boolean).join(' · ')}</AppText>
                  </View>
                </View>
              </HeroCard>
              <Card>
                <Field label={t('pets.species')} value={p.species} />
                <Field label={t('pets.breed')} value={p.breed} />
                <Field label={t('pets.gender')} value={t(`pets.genders.${p.gender}`)} />
                <Field label={t('pets.dob')} value={p.dateOfBirth ? `${formatDate(p.dateOfBirth, language)}${age ? ` (${age.years > 0 ? t('common.yearsShort', { count: age.years }) : t('common.monthsShort', { count: age.months })})` : ''}` : null} />
                <Field label={t('pets.weight')} value={p.weight !== null ? String(p.weight) : null} />
                <Field label={t('pets.color')} value={p.color} />
                <Field label={t('pets.bloodGroup')} value={p.bloodGroup} />
                <Field label={t('pets.neutered')} value={p.isNeutered ? yes : no} />
                <Field label={t('pets.vaccinated')} value={p.isVaccinated ? yes : no} />
                <Field label={t('pets.allergies')} value={p.allergies} />
                <Field label={t('pets.notes')} value={p.notes} />
              </Card>
              <Button title={t('pets.edit')} icon="create-outline" variant="outline" onPress={() => router.push({ pathname: '/pet/form', params: { id: p.id } })} />
              <Button title={t('common.delete')} icon="trash-outline" variant="danger" onPress={confirmDelete} loading={isLoading} />
            </>
          );
        }}
      </AsyncBoundary>
    </Screen>
  );
}
