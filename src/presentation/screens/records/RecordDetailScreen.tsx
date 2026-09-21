import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetMedicalRecordQuery } from '@/data/api/medicalRecordApi';
import { AppText, AsyncBoundary, Card, Screen } from '../../components';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { formatDate } from '../../utils/format';

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={{ gap: 2 }}>
      <AppText variant="label" color="textSecondary">{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

export default function RecordDetailScreen() {
  const { t } = useTranslation();
  const language = useAppSelector(selectLanguage);
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useGetMedicalRecordQuery(Number(id));

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <AsyncBoundary {...query}>
        {(r) => (
          <>
            <AppText variant="title">{r.petName}</AppText>
            <AppText color="textSecondary">{t('records.visit', { date: formatDate(r.visitDate, language) })}</AppText>
            <Card>
              <Field label={t('records.doctor')} value={r.doctorName} />
              <Field label={t('records.symptoms')} value={r.symptoms} />
              <Field label={t('records.diagnosis')} value={r.diagnosis} />
              <Field label={t('records.treatment')} value={r.treatmentNotes} />
              <Field label={t('records.temperature')} value={r.temperatureF !== null ? `${r.temperatureF} °F` : null} />
              <Field label={t('records.weight')} value={r.weightKg !== null ? `${r.weightKg} kg` : null} />
              <Field label={t('records.followUp')} value={r.followUpDate ? formatDate(r.followUpDate, language) : null} />
            </Card>
            <AppText variant="heading">{t('records.prescriptions')}</AppText>
            {r.prescriptions.length === 0 ? (
              <AppText color="textSecondary">{t('records.noPrescriptions')}</AppText>
            ) : (
              r.prescriptions.map((p) => (
                <Card key={p.id}>
                  <AppText variant="subheading">{p.medicineName}</AppText>
                  <Field label={t('records.dosage')} value={p.dosage} />
                  <Field label={t('records.frequency')} value={p.frequency} />
                  <Field label={t('records.durationLabel')} value={p.durationDays ? t('records.duration', { count: p.durationDays }) : null} />
                  <Field label={t('records.instructions')} value={p.instructions} />
                </Card>
              ))
            )}
          </>
        )}
      </AsyncBoundary>
    </Screen>
  );
}
