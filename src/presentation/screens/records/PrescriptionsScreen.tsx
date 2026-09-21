import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { useGetMedicalRecordsQuery } from '@/data/api/medicalRecordApi';
import { useGetPetsQuery } from '@/data/api/petApi';
import { AppText, Card, Chip, EmojiTile, EmptyState, ErrorState, LoadingView, Screen, SectionHeader } from '../../components';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { formatDate } from '../../utils/format';
import { DocumentSection } from './DocumentSection';

// Prescriptions written at your visits (from the clinic) plus any you uploaded yourself.
export default function PrescriptionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const language = useAppSelector(selectLanguage);
  const records = useGetMedicalRecordsQuery();
  const pets = useGetPetsQuery();
  const [petId, setPetId] = useState<number | null>(null);

  const items = useMemo(
    () =>
      (records.data ?? [])
        .filter((r) => petId === null || r.petId === petId)
        .flatMap((r) => r.prescriptions.map((p) => ({ ...p, record: r }))),
    [records.data, petId],
  );

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={records.isFetching && !records.isLoading} onRefresh={records.refetch}>
      {pets.data && pets.data.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('medical.allPets')} selected={petId === null} onPress={() => setPetId(null)} />
          {pets.data.map((p) => <Chip key={p.id} label={p.name} selected={petId === p.id} onPress={() => setPetId(p.id)} />)}
        </ScrollView>
      ) : null}

      <SectionHeader title={t('medical.fromVisits')} />
      {records.isLoading ? (
        <LoadingView />
      ) : records.error && !records.data ? (
        <ErrorState error={records.error} onRetry={records.refetch} />
      ) : items.length === 0 ? (
        <EmptyState emoji="💊" message={t('medical.noPrescriptions')} />
      ) : (
        items.map((p) => (
          <Card key={`${p.record.id}-${p.id}`} onPress={() => router.push({ pathname: '/records/[id]', params: { id: p.record.id } })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <EmojiTile emoji="💊" />
              <View style={{ flex: 1 }}>
                <AppText variant="subheading">{p.medicineName}</AppText>
                <AppText variant="caption" color="textMuted">
                  {[t('medical.prescribedFor', { name: p.record.petName }), formatDate(p.record.visitDate, language), p.record.doctorName].filter(Boolean).join(' · ')}
                </AppText>
              </View>
            </View>
            <View style={{ gap: 2 }}>
              {p.dosage ? <AppText variant="caption">{t('records.dosage')}: <AppText variant="caption" bold>{p.dosage}</AppText></AppText> : null}
              {p.frequency ? <AppText variant="caption">{t('records.frequency')}: <AppText variant="caption" bold>{p.frequency}</AppText></AppText> : null}
              {p.durationDays ? <AppText variant="caption">{t('records.durationLabel')}: <AppText variant="caption" bold>{t('records.duration', { count: p.durationDays })}</AppText></AppText> : null}
              {p.instructions ? <AppText variant="caption" color="textSecondary">{p.instructions}</AppText> : null}
            </View>
          </Card>
        ))
      )}

      <SectionHeader title={t('medical.uploadedByYou')} />
      <DocumentSection category="PRESCRIPTION" petId={petId} emptyMessage={t('medical.noDocuments')} uploadLabel={t('medical.uploadPrescription')} />
    </Screen>
  );
}
