import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { isApiError } from '@/core/errors';
import { useBookAppointmentMutation } from '@/data/api/appointmentApi';
import { useValidateCouponMutation } from '@/data/api/offersApi';
import { useGetPetsQuery } from '@/data/api/petApi';
import type { CouponQuote } from '@/domain/entities';
import { isBookingComplete, toAppointmentInput } from '@/domain/usecases/booking';
import { validateCode, validateOptionalText } from '@/domain/usecases/validation';
import { AppText, Button, Card, Screen, TextField } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectBooking } from '../../state/selectors/bookingSelectors';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { bookingReset, couponChanged, notesChanged } from '../../state/slices/bookingSlice';
import { useTheme } from '../../theme/useTheme';
import { formatCurrency, formatDate } from '../../utils/format';
import { StepHeader } from './StepHeader';

const NOTES_MAX = 500;

function Row({ label, value, tone }: { label: string; value: string; tone?: 'success' }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
      <AppText color="textSecondary">{label}</AppText>
      <AppText bold color={tone} style={{ flexShrink: 1, textAlign: 'right' }}>{value}</AppText>
    </View>
  );
}

export default function ConfirmStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const errorMessage = useApiErrorMessage();
  const language = useAppSelector(selectLanguage);
  const draft = useAppSelector(selectBooking);
  const { data: pets } = useGetPetsQuery();
  const [book, { isLoading }] = useBookAppointmentMutation();
  const [validateCoupon, { isLoading: applying }] = useValidateCouponMutation();

  const [quote, setQuote] = useState<CouponQuote | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const serviceId = draft.selectedService?.id;

  // The backend prices the service and computes the discount; the client only sends the code.
  const applyCode = async (raw: string) => {
    const invalid = validateCode(false)(raw);
    if (invalid) return setCouponError(t(`validation.${invalid.code}`));
    if (!serviceId) return;
    try {
      const q = await validateCoupon({ code: raw.trim().toUpperCase(), serviceId }).unwrap();
      setQuote(q);
      setCouponError(null);
      setCouponInput('');
      dispatch(couponChanged(q.code));
    } catch (e) {
      setQuote(null);
      setCouponError(errorMessage(e));
      dispatch(couponChanged(null)); // never send a coupon the server has just rejected
    }
  };

  // A coupon picked on the Coupon screen is applied automatically once a service is chosen.
  useEffect(() => {
    if (draft.couponCode && serviceId && quote?.code !== draft.couponCode) applyCode(draft.couponCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.couponCode, serviceId]);

  if (!isBookingComplete(draft)) return null;
  const notesErr = validateOptionalText(NOTES_MAX)(draft.notes);
  const notesError = notesErr ? t('validation.tooLong', notesErr.params) : null;
  const pet = pets?.find((p) => p.id === draft.petId);

  const confirm = async () => {
    try {
      await book(toAppointmentInput({ ...draft, couponCode: quote ? quote.code : null })).unwrap();
      dispatch(bookingReset());
      // Navigate first so the flow never depends on the user tapping the alert.
      router.dismissTo('/appointments');
      Alert.alert(t('booking.booked'), t('booking.bookedMessage'));
    } catch (e) {
      if (isApiError(e) && e.status === 409) {
        Alert.alert(t('booking.slotTaken'));
        router.back();
        return;
      }
      Alert.alert(errorMessage(e));
    }
  };

  return (
    <Screen
      edges={['left', 'right', 'bottom']}
      footer={<Button title={t('booking.confirmBooking')} icon="checkmark-circle" variant="success" onPress={confirm} loading={isLoading} disabled={!!notesError} />}>
      <StepHeader current={5} title={t('booking.review')} />
      <Card>
        <Row label={t('booking.service')} value={draft.selectedService.name} />
        <Row label={t('booking.doctor')} value={draft.selectedDoctor.name} />
        <Row label={t('booking.pet')} value={pet?.name ?? ''} />
        <Row label={t('booking.when')} value={`${formatDate(draft.selectedDate, language)} · ${draft.selectedTime}`} />
        <Row label={t('booking.price')} value={formatCurrency(draft.selectedService.price, language)} />
        {quote ? (
          <>
            <Row label={`${t('booking.coupon.discount')} (${quote.code})`} value={`− ${formatCurrency(quote.discount, language)}`} tone="success" />
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
            <Row label={t('booking.coupon.total')} value={formatCurrency(quote.payable, language)} />
          </>
        ) : null}
      </Card>

      <Card style={{ gap: 10 }}>
        {quote ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <AppText color="success" bold style={{ flex: 1 }}>🎉 {t('booking.coupon.applied', { code: quote.code })}</AppText>
            <Button
              title={t('booking.coupon.remove')}
              variant="ghost"
              compact
              onPress={() => {
                setQuote(null);
                dispatch(couponChanged(null));
              }}
            />
          </View>
        ) : (
          <>
            <TextField
              label={t('booking.coupon.have')}
              placeholder={t('booking.coupon.placeholder')}
              icon="pricetag-outline"
              value={couponInput}
              onChangeText={(v) => {
                setCouponInput(v.toUpperCase().replace(/\s/g, ''));
                setCouponError(null);
              }}
              error={couponError}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={() => applyCode(couponInput)}
            />
            <Button title={t('booking.coupon.apply')} variant="outline" compact loading={applying} onPress={() => applyCode(couponInput)} style={{ alignSelf: 'flex-start' }} />
          </>
        )}
      </Card>

      <TextField
        label={`${t('booking.notes')} (${t('common.optional')})`}
        placeholder={t('booking.notesPlaceholder')}
        value={draft.notes}
        onChangeText={(v) => dispatch(notesChanged(v))}
        multiline
        maxLength={NOTES_MAX}
        showCounter
        error={notesError}
      />
    </Screen>
  );
}
