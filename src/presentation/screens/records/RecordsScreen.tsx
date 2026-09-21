import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetDocumentsQuery } from '@/data/api/documentApi';
import { useGetMedicalRecordsQuery } from '@/data/api/medicalRecordApi';
import { AppText, Card, EmojiTile, EmptyState, ErrorState, LoadingView, Screen, SectionHeader } from '../../components';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { useTheme } from '../../theme/useTheme';
import { formatDate } from '../../utils/format';

interface Item {
  key: string;
  emoji: string;
  title: string;
  subtitle: string;
  href: Href;
}

// Medical Records hub: four entry points (prescriptions, lab reports, vaccinations, upload) above the visit history.
export default function RecordsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const language = useAppSelector(selectLanguage);
  const records = useGetMedicalRecordsQuery();
  const documents = useGetDocumentsQuery(undefined);

  const counts = useMemo(() => {
    const docs = documents.data ?? [];
    const of = (c: string) => docs.filter((d) => d.category === c).length;
    const visitRx = (records.data ?? []).reduce((n, r) => n + r.prescriptions.length, 0);
    return { prescriptions: visitRx + of('PRESCRIPTION'), reports: of('LAB_REPORT'), certificates: of('VACCINATION'), documents: docs.length };
  }, [documents.data, records.data]);

  const items: Item[] = [
    { key: 'rx', emoji: '💊', title: t('medical.prescription'), subtitle: t('medical.prescriptionsCount', { count: counts.prescriptions }), href: '/records/prescriptions' },
    { key: 'lab', emoji: '🧪', title: t('medical.labReports'), subtitle: t('medical.reportsCount', { count: counts.reports }), href: '/records/lab-reports' },
    { key: 'vax', emoji: '💉', title: t('medical.vaccinations'), subtitle: t('medical.certificatesCount', { count: counts.certificates }), href: '/vaccination' },
    { key: 'upload', emoji: '📤', title: t('medical.upload'), subtitle: t('medical.uploadHint'), href: '/records/upload' },
  ];

  const refresh = () => {
    records.refetch();
    documents.refetch();
  };

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={(records.isFetching || documents.isFetching) && !records.isLoading} onRefresh={refresh}>
      {items.map((item) => (
        <Card key={item.key} onPress={() => router.push(item.href)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <EmojiTile emoji={item.emoji} size={54} />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="subheading">{item.title}</AppText>
            <AppText variant="caption" color="textMuted">{item.subtitle}</AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Card>
      ))}

      <SectionHeader title={t('medical.visitHistory')} />
      {records.isLoading ? (
        <LoadingView />
      ) : records.error && !records.data ? (
        <ErrorState error={records.error} onRetry={records.refetch} />
      ) : records.data && records.data.length > 0 ? (
        records.data.map((r) => (
          <Card key={r.id} onPress={() => router.push({ pathname: '/records/[id]', params: { id: r.id } })}>
            <AppText variant="subheading">{r.petName}</AppText>
            <AppText color="textSecondary">{t('records.visit', { date: formatDate(r.visitDate, language) })}</AppText>
            {r.diagnosis ? <AppText numberOfLines={2}>{r.diagnosis}</AppText> : null}
          </Card>
        ))
      ) : (
        <EmptyState message={t('records.empty')} />
      )}
    </Screen>
  );
}
