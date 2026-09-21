import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useGetAppointmentQuery, useRescheduleAppointmentMutation } from '@/data/api/appointmentApi';
import { isApiError } from '@/core/errors';
import { AsyncBoundary, Button, Screen } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { SlotPicker } from '../booking/SlotPicker';

export default function RescheduleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const errorMessage = useApiErrorMessage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useGetAppointmentQuery(Number(id));
  const [reschedule, { isLoading }] = useRescheduleAppointmentMutation();
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const submit = async () => {
    if (!date || !time) return;
    try {
      await reschedule({ id: Number(id), date, time }).unwrap();
      Alert.alert(t('appointments.rescheduled'));
      router.back();
    } catch (e) {
      Alert.alert(isApiError(e) && e.status === 409 ? t('booking.slotTaken') : errorMessage(e));
    }
  };

  return (
    <Screen
      edges={['left', 'right', 'bottom']}
      footer={<Button title={t('appointments.rescheduleConfirm')} disabled={!date || !time} loading={isLoading} onPress={submit} />}>
      <AsyncBoundary {...query}>
        {(a) =>
          a.doctorId ? (
            <SlotPicker
              doctorId={a.doctorId}
              date={date}
              time={time}
              onDateChange={(d) => {
                setDate(d);
                setTime(null);
              }}
              onTimeChange={setTime}
            />
          ) : null
        }
      </AsyncBoundary>
    </Screen>
  );
}
