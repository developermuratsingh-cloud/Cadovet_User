import { useRouter } from 'expo-router';
import { Children, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useBookHomeVisitMutation } from '@/data/api/appointmentApi';
import type { HomeVisitConfirmation } from '@/domain/entities';
import {
  DEFAULT_HOME_VISIT,
  NOTES_MAX_CHARS,
  NOTES_MAX_WORDS,
  countWords,
  limitWords,
  slotsFor,
  toHomeVisitInput,
  type HomeVisitForm,
} from '@/domain/usecases/booking';
import { addDays, toDateString } from '@/domain/usecases/dates';
import {
  validateAge,
  validateName,
  validateOptionalEmail,
  validateRequiredText,
  validateTenDigitPhone,
} from '@/domain/usecases/validation';
import { AppText, Button, Card, DatePicker, DateField, Screen, SelectField, TextField } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useForm } from '../../hooks/useForm';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectBooking } from '../../state/selectors/bookingSelectors';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { bookingReset } from '../../state/slices/bookingSlice';
import { useTheme } from '../../theme/useTheme';
import { formatDate } from '../../utils/format';

const DAYS_AHEAD = 90;
// Smaller than the app default so values like an email address stay on one line.
const input = { fontSize: 13 } as const;

const required = (v: string) => validateRequiredText(1000)(v);
const validators = {
  ownerName: (v: string) => validateRequiredText(30)(v) ?? validateName(v),
  phone: validateTenDigitPhone,
  email: validateOptionalEmail,
  species: validateRequiredText(30),
  petName: validateRequiredText(60),
  breed: validateRequiredText(60),
  age: validateAge,
  gender: required,
  aggressive: required,
  date: required,
  time: required,
  address: validateRequiredText(300),
  notes: validateRequiredText(NOTES_MAX_CHARS),
};

// Two fields side by side, as on the website; a lone field keeps its half-width column.
function Pair({ children, alignBottom }: { children: ReactNode; alignBottom?: boolean }) {
  const items = Children.toArray(children);
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: alignBottom ? 'flex-end' : 'stretch' }}>
      {items.map((child, i) => (
        <View key={i} style={{ flex: 1 }}>{child}</View>
      ))}
      {items.length === 1 ? <View style={{ flex: 1 }} /> : null}
    </View>
  );
}

function Confirmation({ result, onAnother }: { result: HomeVisitConfirmation; onAnother: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const language = useAppSelector(selectLanguage);
  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Card style={{ alignItems: 'center', gap: 10, padding: 24 }}>
        <AppText style={{ fontSize: 40 }}>🎉</AppText>
        <AppText variant="heading" color="success" style={{ textAlign: 'center' }}>{t('booking.visitRequested')}</AppText>
        <AppText color="textSecondary" style={{ textAlign: 'center' }}>
          {t('booking.visitRequestedMessage', { name: result.customerName, date: formatDate(result.date, language), time: result.time })}
        </AppText>
        <Button title={t('booking.bookAnother')} variant="lime" compact onPress={onAnother} />
      </Card>
      <Button title={t('booking.viewAppointments')} icon="calendar" onPress={() => router.dismissTo('/appointments')} />
    </Screen>
  );
}

// The website's "Book Home Visit" form. Every field starts empty and shows only its placeholder.
export default function BookingForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const errorMessage = useApiErrorMessage();
  const language = useAppSelector(selectLanguage);
  const { selectedService } = useAppSelector(selectBooking);
  const [book, { isLoading }] = useBookHomeVisitMutation();

  const today = useMemo(() => toDateString(new Date()), []);
  const lastDay = useMemo(() => addDays(today, DAYS_AHEAD), [today]);
  const initial: HomeVisitForm = {
    ownerName: '',
    phone: '',
    email: '',
    species: '',
    petName: '',
    breed: '',
    age: '',
    gender: '',
    aggressive: '',
    date: '',
    time: '',
    address: '',
    notes: '',
  };
  const form = useForm<HomeVisitForm>(initial, validators);
  const [dateOpen, setDateOpen] = useState(false);
  const [result, setResult] = useState<HomeVisitConfirmation | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { values, setValue, fieldProps } = form;

  // A service picked from a Home or Vaccination shortcut is booked as that service; otherwise the website's default.
  const service = selectedService
    ? { serviceId: selectedService.id, serviceName: selectedService.name, totalAmount: selectedService.price }
    : DEFAULT_HOME_VISIT;

  const submit = form.handleSubmit(async (f) => {
    setSubmitError(null);
    try {
      setResult(await book(toHomeVisitInput(f, service)).unwrap());
      dispatch(bookingReset());
    } catch (e) {
      setSubmitError(errorMessage(e));
    }
  });

  if (result) {
    return (
      <Confirmation
        result={result}
        onAnother={() => {
          form.reset(initial);
          setResult(null);
        }}
      />
    );
  }

  const select = (key: keyof HomeVisitForm) => ({ value: values[key], onChange: (v: string) => setValue(key, v), error: fieldProps(key).error });
  const words = countWords(values.notes);

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Card style={{ gap: 14 }}>
        <View style={{ gap: 4 }}>
          <AppText variant="subheading" style={{ textTransform: 'uppercase' }}>{t('booking.homeVisitTitle')}</AppText>
          <AppText variant="caption" color="textMuted">{selectedService ? selectedService.name : t('booking.homeVisitTagline')}</AppText>
        </View>

        {submitError ? (
          <View style={{ backgroundColor: `${colors.danger}1A`, borderColor: colors.danger, borderWidth: 1, borderRadius: 10, padding: 12 }}>
            <AppText color="danger" accessibilityRole="alert">{submitError}</AppText>
          </View>
        ) : null}

        <Pair>
          <TextField style={input} {...fieldProps('ownerName')} label={`${t('booking.ownerName')} *`} placeholder={t('booking.ownerNamePlaceholder')} maxLength={30} />
          <TextField
            style={input}
            {...fieldProps('phone', (v) => v.replace(/\D/g, '').slice(0, 10))}
            label={`${t('booking.phone')} *`}
            placeholder={t('booking.phonePlaceholder')}
            keyboardType="number-pad"
            maxLength={10}
          />
        </Pair>
        <TextField
          style={input}
          {...fieldProps('email')}
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pair>
          <TextField style={input} {...fieldProps('petName')} label={`${t('booking.petName')} *`} placeholder={t('booking.petNamePlaceholder')} maxLength={60} />
          <TextField style={input} {...fieldProps('breed')} label={`${t('booking.petBreed')} *`} placeholder={t('booking.breedPlaceholder')} maxLength={60} />
        </Pair>
        <Pair>
          <TextField style={input} {...fieldProps('species')} label={`${t('booking.species')} *`} placeholder={t('booking.speciesPlaceholder')} maxLength={30} />
          <TextField
            style={input}
            {...fieldProps('age', (v) => v.replace(/[^0-9.]/g, '').slice(0, 5))}
            label={`${t('booking.petAge')} *`}
            placeholder={t('booking.agePlaceholder')}
            keyboardType="decimal-pad"
          />
        </Pair>
        <Pair alignBottom>
          <SelectField
            label={`${t('booking.petGender')} *`}
            placeholder={t('booking.selectGender')}
            options={[
              { value: 'MALE', label: t('booking.male') },
              { value: 'FEMALE', label: t('booking.female') },
              { value: 'UNKNOWN', label: t('booking.unknown') },
            ]}
            {...select('gender')}
          />
          <SelectField
            label={`${t('booking.aggressive')} *`}
            placeholder={t('booking.select')}
            options={[{ value: 'no', label: t('booking.no') }, { value: 'yes', label: t('booking.yes') }]}
            {...select('aggressive')}
          />
        </Pair>
        <Pair>
          <DateField
            label={`${t('booking.preferredDate')} *`}
            display={values.date ? formatDate(values.date, language) : ''}
            placeholder={t('booking.selectDate')}
            error={fieldProps('date').error}
            onPress={() => setDateOpen(true)}
            visible={dateOpen}
            onClose={() => setDateOpen(false)}>
            <DatePicker
              value={values.date || null}
              onChange={(d) => {
                setValue('date', d);
                // Keep the time valid for the new day: a slot that has passed today is not offered.
                if (values.time && !slotsFor(d).includes(values.time)) setValue('time', '');
                setDateOpen(false);
              }}
              minDate={today}
              maxDate={lastDay}
            />
          </DateField>
          <SelectField
            label={`${t('booking.timeSlot')} *`}
            placeholder={t('booking.select')}
            options={slotsFor(values.date || today).map((slot) => ({ value: slot, label: slot }))}
            {...select('time')}
          />
        </Pair>
        <TextField style={input} {...fieldProps('address')} label={`${t('booking.address')} *`} placeholder={t('booking.addressPlaceholder')} maxLength={300} />
        <TextField
          style={input}
          {...fieldProps('notes', (v) => limitWords(v, NOTES_MAX_WORDS).slice(0, NOTES_MAX_CHARS))}
          label={`${t('booking.concerns')} *`}
          placeholder={t('booking.concernsPlaceholder')}
          multiline
          helper={t('booking.words', { count: words })}
        />

        <Button title={`${t('booking.bookNow')} →`} variant="lime" onPress={submit} loading={isLoading} />
      </Card>
    </Screen>
  );
}
