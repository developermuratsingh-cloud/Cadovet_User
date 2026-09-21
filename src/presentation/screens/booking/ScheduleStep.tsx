import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, Screen } from '../../components';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectBooking } from '../../state/selectors/bookingSelectors';
import { dateSelected, timeSelected } from '../../state/slices/bookingSlice';
import { SlotPicker } from './SlotPicker';
import { StepHeader } from './StepHeader';

export default function ScheduleStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedDoctor, selectedDate, selectedTime } = useAppSelector(selectBooking);

  if (!selectedDoctor) return null;

  return (
    <Screen
      edges={['left', 'right', 'bottom']}
      footer={<Button title={t('common.next')} icon="arrow-forward" disabled={!selectedDate || !selectedTime} onPress={() => router.push('/book/confirm')} />}>
      <StepHeader current={4} title={t('booking.when')} />
      <SlotPicker
        doctorId={selectedDoctor.id}
        date={selectedDate}
        time={selectedTime}
        onDateChange={(d) => dispatch(dateSelected(d))}
        onTimeChange={(time) => dispatch(timeSelected(time))}
      />
    </Screen>
  );
}
