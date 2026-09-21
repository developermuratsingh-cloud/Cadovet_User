import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetAppointmentsQuery } from '@/data/api/appointmentApi';
import { partitionAppointments } from '@/domain/usecases/appointments';
import { AppText, AsyncBoundary, Button, EmptyState, MenuButton, Screen, SegmentedControl } from '../../components';
import { View } from 'react-native';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { bookingReset } from '../../state/slices/bookingSlice';
import { AppointmentCard } from './AppointmentCard';

export default function AppointmentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const query = useGetAppointmentsQuery();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const groups = useMemo(() => (query.data ? partitionAppointments(query.data) : null), [query.data]);
  const list = groups?.[tab] ?? [];

  const open = (id: number) => router.push({ pathname: '/appointment/[id]', params: { id } });

  return (
    <Screen refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch} contentStyle={{ paddingBottom: 96 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MenuButton />
        <AppText variant="title" style={{ flex: 1 }}>{t('appointments.title')}</AppText>
      </View>
      <Button
        title={t('appointments.newBooking')}
        icon="add-circle"
        variant="success"
        onPress={() => {
          dispatch(bookingReset());
          router.push('/book');
        }}
      />
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: 'upcoming', label: `${t('appointments.upcoming')} (${groups?.upcoming.length ?? 0})` },
          { value: 'past', label: `${t('appointments.past')} (${groups?.past.length ?? 0})` },
        ]}
      />
      <AsyncBoundary {...query}>
        {() =>
          list.length ? (
            list.map((a) => <AppointmentCard key={a.id} appointment={a} onPress={() => open(a.id)} />)
          ) : (
            <EmptyState emoji="📅" message={tab === 'upcoming' ? t('appointments.emptyUpcoming') : t('appointments.emptyPast')} />
          )
        }
      </AsyncBoundary>
    </Screen>
  );
}
