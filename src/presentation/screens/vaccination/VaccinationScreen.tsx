import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetAppointmentsQuery } from '@/data/api/appointmentApi';
import { useGetPetsQuery } from '@/data/api/petApi';
import { useGetServicesQuery } from '@/data/api/serviceApi';
import type { Service } from '@/domain/entities';
import { isVaccinationService, vaccinationSummary } from '@/domain/usecases/vaccination';
import { AppText, Button, Card, EmojiTile, EmptyState, HeroCard, LoadingView, Screen, SectionHeader, StatusBadge } from '../../components';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { bookingReset, serviceSelected } from '../../state/slices/bookingSlice';
import { formatCurrency, formatDate } from '../../utils/format';
import { DocumentSection } from '../records/DocumentSection';
import { petEmoji } from '../../utils/icons';

export default function VaccinationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const pets = useGetPetsQuery();
  const appointments = useGetAppointmentsQuery();
  const services = useGetServicesQuery();

  const summary = useMemo(() => (pets.data && appointments.data ? vaccinationSummary(pets.data, appointments.data) : null), [pets.data, appointments.data]);
  const vaccineServices = useMemo(() => (services.data ?? []).filter(isVaccinationService), [services.data]);
  const refresh = () => {
    pets.refetch();
    appointments.refetch();
    services.refetch();
  };

  const book = (service: Service) => {
    dispatch(bookingReset());
    dispatch(serviceSelected(service));
    router.push('/book/doctor');
  };

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={(pets.isFetching || appointments.isFetching || services.isFetching) && !pets.isLoading} onRefresh={refresh}>
      <HeroCard>
        <AppText style={{ fontSize: 34, lineHeight: 44 }}>💉</AppText>
        <AppText variant="title" style={{ color: '#FFFFFF' }}>{t('vaccination.title')}</AppText>
        <AppText style={{ color: 'rgba(255,255,255,0.92)' }}>{t('vaccination.subtitle')}</AppText>
      </HeroCard>

      <SectionHeader title={t('vaccination.statusTitle')} />
      {!summary ? (
        pets.isError || appointments.isError ? null : <LoadingView />
      ) : summary.length === 0 ? (
        <EmptyState emoji="🐶" message={t('vaccination.noPets')} actionLabel={t('pets.add')} onAction={() => router.push('/pet/form')} />
      ) : (
        summary.map(({ pet, isVaccinated, lastDate, next }) => (
          <Card key={pet.id} onPress={() => router.push({ pathname: '/pet/[id]', params: { id: pet.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <EmojiTile emoji={petEmoji(pet.species)} size={52} />
            <View style={{ flex: 1, gap: 3 }}>
              <AppText variant="subheading">{pet.name}</AppText>
              <StatusBadge label={isVaccinated ? t('vaccination.vaccinated') : t('vaccination.notVaccinated')} tone={isVaccinated ? 'success' : 'warning'} />
              <AppText variant="caption" color="textMuted">
                {lastDate ? t('vaccination.lastVaccination', { date: formatDate(lastDate, language) }) : t('vaccination.noRecord')}
              </AppText>
              {next ? <AppText variant="caption" color="primaryDark" bold>{t('vaccination.next', { date: formatDate(next.date, language), time: next.time })}</AppText> : null}
            </View>
          </Card>
        ))
      )}

      <SectionHeader title={t('vaccination.servicesTitle')} />
      {services.isLoading ? (
        <LoadingView />
      ) : vaccineServices.length === 0 ? (
        <EmptyState message={t('vaccination.noServices')} />
      ) : (
        vaccineServices.map((s) => (
          <Card key={s.id} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <EmojiTile emoji="💉" />
              <View style={{ flex: 1 }}>
                <AppText variant="subheading">{s.name}</AppText>
                <AppText variant="label" color="primaryDark">{formatCurrency(s.price, language)}{s.durationMinutes ? `  ·  ${t('common.minutesShort', { count: s.durationMinutes })}` : ''}</AppText>
              </View>
            </View>
            {s.description ? <AppText variant="caption" color="textSecondary">{s.description}</AppText> : null}
            <Button title={t('vaccination.book')} icon="calendar" variant="success" compact onPress={() => book(s)} />
          </Card>
        ))
      )}

      <SectionHeader title={t('medical.certificates')} />
      <DocumentSection category="VACCINATION" emptyMessage={t('medical.noCertificates')} uploadLabel={t('medical.uploadCertificate')} />
    </Screen>
  );
}
