import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetAvailabilityQuery } from '@/data/api/appointmentApi';
import { filterFutureSlots } from '@/domain/usecases/appointments';
import { addDays, toDateString } from '@/domain/usecases/dates';
import { AppText, Chip, DatePicker, EmptyState, ErrorState, LoadingView } from '../../components';

interface Props {
  doctorId: number;
  date: string | null;
  time: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const DAYS_AHEAD = 90; // how far ahead a visit can be booked

// Date strip + time slots driven by the backend's availability endpoint (working days, hours, booked slots).
export function SlotPicker({ doctorId, date, time, onDateChange, onTimeChange }: Props) {
  const { t } = useTranslation();
  const today = useMemo(() => toDateString(new Date()), []);
  const lastDay = useMemo(() => addDays(today, DAYS_AHEAD), [today]);
  // A draft date from an earlier day (e.g. the app stayed open overnight) is no longer selectable.
  const selectedDate = date && date >= today ? date : null;
  const { currentData: data, isFetching, error, refetch } = useGetAvailabilityQuery({ doctorId, date: selectedDate ?? '' }, { skip: !selectedDate });
  const slots = useMemo(() => (data && selectedDate ? filterFutureSlots(data, selectedDate) : []), [data, selectedDate]);

  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 8 }}>
        <AppText variant="subheading">{t('booking.chooseDate')}</AppText>
        <DatePicker value={selectedDate} onChange={onDateChange} minDate={today} maxDate={lastDay} />
      </View>

      {selectedDate ? (
        <View style={{ gap: 8 }}>
          <AppText variant="subheading">{t('booking.chooseTime')}</AppText>
          {isFetching && !data ? (
            <LoadingView />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : slots.length === 0 ? (
            <EmptyState message={t('booking.noSlots')} />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {slots.map((s) => (
                <Chip key={s.time} label={s.time} selected={s.time === time} disabled={!s.available} onPress={() => onTimeChange(s.time)} />
              ))}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}
