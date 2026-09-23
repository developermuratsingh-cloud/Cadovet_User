import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { openWhatsApp } from '../../utils/contact';
import { Alert, View } from 'react-native';

import { useCancelAppointmentMutation, useGetAppointmentQuery } from '@/data/api/appointmentApi';
import { canModify } from '@/domain/usecases/appointments';
import { AppText, AsyncBoundary, Button, Card, Screen, StatusBadge } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { formatCurrency, formatDate } from '../../utils/format';
import { statusTone } from './AppointmentCard';

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={{ gap: 2 }}>
      <AppText variant="label" color="textSecondary">{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

export default function AppointmentDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const errorMessage = useApiErrorMessage();
  const language = useAppSelector(selectLanguage);
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useGetAppointmentQuery(Number(id));
  const [cancel, { isLoading: cancelling }] = useCancelAppointmentMutation();

  const confirmCancel = () =>
    Alert.alert(t('appointments.cancelTitle'), t('appointments.cancelMessage'), [
      { text: t('appointments.keep'), style: 'cancel' },
      {
        text: t('appointments.cancel'),
        style: 'destructive',
        onPress: async () => {
          try {
            await cancel(Number(id)).unwrap();
            Alert.alert(t('appointments.cancelled'));
          } catch (e) {
            Alert.alert(errorMessage(e));
          }
        },
      },
    ]);

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <AsyncBoundary {...query}>
        {(a) => (
          <>
            <StatusBadge label={t(`appointments.status.${a.status}`)} tone={statusTone(a.status)} />
            <AppText variant="title">{a.serviceName ?? a.reason ?? t('appointments.detailTitle')}</AppText>
            <Card>
              <Field label={t('booking.when')} value={`${formatDate(a.date, language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${a.time}`} />
              <Field label={t('booking.pet')} value={a.petName} />
              <Field label={t('booking.doctor')} value={a.doctorName ?? t('appointments.doctorPending')} />
              <Field label={t('appointments.reason')} value={a.reason} />
              {a.couponCode ? <Field label={t('appointments.couponApplied', { code: a.couponCode })} value={`− ${formatCurrency(a.discountAmount, language)}`} /> : null}
              <Field label={t('appointments.notes')} value={a.notes} />
            </Card>
            <AppText variant="label" color="textSecondary">{t('support.needHelp')}</AppText>
            <Button
              title={t('support.whatsapp')}
              icon="logo-whatsapp"
              variant="whatsapp"
              onPress={() =>
                openWhatsApp(
                  t('support.appointmentMessage', { lng: 'en', date: formatDate(a.date, 'en'), time: a.time, pet: a.petName }),
                )
              }
            />
            {canModify(a) ? (
              <View style={{ gap: 12 }}>
                <Button title={t('appointments.reschedule')} variant="outline" onPress={() => router.push({ pathname: '/appointment/reschedule/[id]', params: { id: a.id } })} />
                <Button title={t('appointments.cancel')} variant="danger" onPress={confirmCancel} loading={cancelling} />
              </View>
            ) : null}
          </>
        )}
      </AsyncBoundary>
    </Screen>
  );
}
